/**
 * YaskCode | beehiiv -> HubSpot | V4 segura
 * Copia para distribución: derivada del archivo operativo aportado por la mantenedora.
 * Experimental: simulación por defecto; no instalar sobre producción.
 * No cambia consentimientos nativos de marketing ni envía correos.
 */
function sincronizarYaskCodeV4() {
  // Cambiar únicamente en un proyecto de desarrollo después de validar el plan.
  const DRY_RUN = true; // Distribución: ninguna escritura por defecto
  const MAX_PAGINAS = 20;
  const MAX_SUSCRIPTORES = 500;
  const MAX_ESCRITURAS = 1; // Una escritura como máximo
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    console.log('V4: otra sincronización en curso.');
    return;
  }
  try {
    const p = PropertiesService.getScriptProperties();
    const beeKey = p.getProperty('BEEHIIV_API_KEY');
    const pubId = p.getProperty('BEEHIIV_PUBLICATION_ID');
    const hsToken = p.getProperty('HUBSPOT_ACCESS_TOKEN');
    if (!beeKey || !pubId || !hsToken) throw new Error('Faltan propiedades secretas.');

    function request(url, method, token, data, readOnly) {
      const options = {
        method: method,
        muteHttpExceptions: true,
        headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' }
      };
      if (data !== undefined) {
        options.contentType = 'application/json';
        options.payload = JSON.stringify(data);
      }
      // Reintentar SOLO lecturas. Nunca repetir ciegamente POST de creación o PATCH.
      for (let attempt = 0; attempt < (readOnly ? 3 : 1); attempt++) {
        const response = UrlFetchApp.fetch(url, options);
        const status = response.getResponseCode();
        if (status >= 200 && status < 300) {
          const raw = response.getContentText();
          return { status: status, body: raw ? JSON.parse(raw) : {} };
        }
        if (readOnly && [429, 500, 502, 503, 504].includes(status) && attempt < 2) {
          Utilities.sleep(1000 * (attempt + 1));
          continue;
        }
        throw new Error('API HTTP ' + status + '; consultar registros antes de reintentar.');
      }
    }

    const base = 'https://api.beehiiv.com/v2/publications/' +
      encodeURIComponent(pubId) + '/subscriptions?limit=100&status=all';
    function leerBeehiiv() {
      const subs = [], emails = new Set(), cursors = new Set();
      let cursor = null, complete = false, paginas = 0;
      for (let i = 0; i < MAX_PAGINAS; i++) {
        const url = base + (cursor ? '&cursor=' + encodeURIComponent(cursor) : '');
        const data = request(url, 'get', beeKey, undefined, true).body;
        if (!Array.isArray(data.data)) throw new Error('beehiiv: data inválida.');
        paginas++;
        for (const s of data.data) {
          const email = String(s.email || '').trim().toLowerCase();
          const estado = String(s.status || '').trim().toLowerCase();
          if (!email || !estado || emails.has(email)) throw new Error('beehiiv: correo/estado ausente o duplicado.');
          emails.add(email);
          subs.push({ email: email, estado: estado, created: s.created });
          if (subs.length > MAX_SUSCRIPTORES) throw new Error('Límite de suscriptores superado.');
        }
        const page = data.pagination || data;
        if (typeof page.has_more !== 'boolean') throw new Error('beehiiv: paginación no verificable.');
        if (!page.has_more) { complete = true; break; }
        if (!page.next_cursor || cursors.has(page.next_cursor)) throw new Error('beehiiv: cursor inválido.');
        cursors.add(page.next_cursor);
        cursor = page.next_cursor;
      }
      if (!complete) throw new Error('beehiiv: lectura incompleta.');
      return { suscriptores: subs, paginas: paginas };
    }

    function buscar(email) {
      const result = request(
        'https://api.hubapi.com/crm/v3/objects/contacts/search',
        'post', hsToken,
        { filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
          properties: ['email','beehiiv_subscription_status','yaskcode_contact_source','yaskcode_relationship'], limit: 2 },
        true
      ).body;
      if (!Array.isArray(result.results)) throw new Error('HubSpot: búsqueda inválida.');
      return result.results;
    }

    const leido = leerBeehiiv();
    const resumen = {
      modo: DRY_RUN ? 'DRY_RUN' : 'REAL', examinados: leido.suscriptores.length,
      sinCambios: 0, crear: 0, actualizar: 0, inactivosSinContacto: 0,
      reactivacionesEnRevision: 0, casosEnRevision: 0, estadosDesconocidos: 0,
      paginas: leido.paginas, lecturaCompleta: true, pendientesDiferidos: 0, operacionesAplicadas: 0
    };
    const plan = [];
    // Estados conocidos. 'inactive' NO acredita el motivo de una baja.
    const estados = { active:'active', pending:'pending', validating:'pending',
      inactive:'inactive', invalid:'inactive', unsubscribed:'unsubscribed', bounced:'bounced' };

    for (const sub of leido.suscriptores) {
      const nuevo = estados[sub.estado];
      if (!nuevo) { resumen.estadosDesconocidos++; continue; }
      const found = buscar(sub.email);
      if (found.length > 1) { resumen.casosEnRevision++; continue; }
      if (!found.length) {
        if (sub.estado !== 'active') { resumen.inactivosSinContacto++; continue; }
        const seconds = Number(sub.created);
        const date = new Date(seconds * 1000);
        if (!Number.isFinite(seconds) || seconds <= 0 || isNaN(date.getTime()) ||
            date.getTime() > Date.now()) { resumen.casosEnRevision++; continue; }
        const ymd = date.toISOString().slice(0,10);
        plan.push({ tipo:'crear', email:sub.email, estadoBeehiiv:sub.estado,
          properties: { email:sub.email, yaskcode_contact_source:'beehiiv_newsletter',
            yaskcode_relationship:'newsletter_subscriber', beehiiv_subscription_status:'active',
            beehiiv_subscribed_at:String(Date.parse(ymd + 'T00:00:00.000Z')) } });
        resumen.crear++;
        continue;
      }
      const c = found[0], props = c.properties || {};
      const antiguo = props.beehiiv_subscription_status || '';
      const relacion = String(props.yaskcode_relationship || '').split(';');
      const vinculo = props.yaskcode_contact_source === 'beehiiv_newsletter' ||
        relacion.includes('newsletter_subscriber');
      if (!vinculo || !antiguo) { resumen.casosEnRevision++; continue; }
      if (antiguo === nuevo) { resumen.sinCambios++; continue; }
      if (nuevo === 'active') { resumen.reactivacionesEnRevision++; continue; }
      // Conservar otros campos CRM, incluidos intereses, origen y relaciones.
      plan.push({ tipo:'actualizar', email:sub.email, id:c.id,
        estadoAnterior:antiguo, estadoNuevo:nuevo, estadoBeehiiv:sub.estado });
      resumen.actualizar++;
    }

    console.log('=== PLAN YASKCODE V4 ===');
    console.log(JSON.stringify(resumen, null, 2));
    if (resumen.casosEnRevision || resumen.estadosDesconocidos) {
      console.log('BLOQUEADO: existen casos ambiguos.'); return;
    }
    // Procesar primero las bajas y estados no activos. Las altas van despues.
    // Limitar el lote permite completar el trabajo en ejecuciones posteriores.
    plan.sort((a, b) =>
      (a.tipo === 'actualizar' ? 0 : 1) - (b.tipo === 'actualizar' ? 0 : 1));
    const lote = plan.slice(0, MAX_ESCRITURAS);
    resumen.pendientesDiferidos = plan.length - lote.length;
    if (resumen.pendientesDiferidos > 0) {
      console.log('AVISO: quedan ' + resumen.pendientesDiferidos +
        ' operaciones para una ejecucion posterior.');
    }
    if (resumen.reactivacionesEnRevision > 0) {
      console.log('ATENCION: hay reactivaciones bloqueadas que necesitan comprobacion de consentimiento.');
    }
    if (DRY_RUN) {
      console.log('SIMULACIÓN COMPLETA: ninguna escritura.');
      return;
    }

    // Cada operación se vuelve a validar. Una reactivación queda bloqueada.
    for (const op of lote) {
      const actualBee = leerBeehiiv().suscriptores.filter(s => s.email === op.email);
      if (actualBee.length !== 1 || actualBee[0].estado !== op.estadoBeehiiv) {
        throw new Error('Cambio en beehiiv: escritura suspendida.');
      }
      const found = buscar(op.email);
      if (op.tipo === 'crear') {
        if (op.estadoBeehiiv !== 'active') throw new Error('Alta no activa: detenida.');
        if (found.length) throw new Error('Contacto existente: creación suspendida.');
        const result = request('https://api.hubapi.com/crm/v3/objects/contacts',
          'post', hsToken, { properties:Object.assign({}, op.properties,
            { beehiiv_last_sync:new Date().toISOString() }) }, false);
        if (result.status !== 201 || !result.body.id) throw new Error('Creación no confirmada.');
      } else {
        if (op.estadoNuevo === 'active') throw new Error('Reactivacion bloqueada.');
        if (found.length !== 1 || String(found[0].id) !== String(op.id) ||
            found[0].properties.beehiiv_subscription_status !== op.estadoAnterior) {
          throw new Error('HubSpot cambió: actualización suspendida.');
        }
        const actuales = found[0].properties || {};
        const relaciones = String(actuales.yaskcode_relationship || '').split(';');
        if (actuales.yaskcode_contact_source !== 'beehiiv_newsletter' &&
            !relaciones.includes('newsletter_subscriber')) {
          throw new Error('Vínculo CRM cambió: actualización suspendida.');
        }
        const result = request('https://api.hubapi.com/crm/v3/objects/contacts/' +
          encodeURIComponent(op.id), 'patch', hsToken,
          { properties:{ beehiiv_subscription_status:op.estadoNuevo,
            beehiiv_last_sync:new Date().toISOString() } }, false);
        if (result.status !== 200 || String(result.body.id) !== String(op.id) ||
            !result.body.properties || result.body.properties.beehiiv_subscription_status !== op.estadoNuevo) {
          throw new Error('Actualización no confirmada; revisar HubSpot.');
        }
      }
      resumen.operacionesAplicadas++;
    }
    console.log('=== RESULTADO FINAL V4 ===');
    console.log(JSON.stringify(resumen, null, 2));
  } catch (e) {
    // No propagar mensajes de plataforma que puedan incluir datos privados.
    console.log('V4 DETENIDO: revisar configuración, cuotas y conectividad.');
    throw new Error('YASKCODE_SYNC_FAILED');
  } finally {
    lock.releaseLock();
  }
}
