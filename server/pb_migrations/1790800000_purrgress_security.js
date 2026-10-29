/// <reference path="../pb_data/types.d.ts" />

/**
 * Sicherheits-Einstellungen, die nicht von Hand vergessen werden sollen.
 *
 * - Rate Limits: bremsen automatisierte Anmelde- und Registrierungsversuche
 *   (u. a. das Durchprobieren von Einladungscodes).
 * - Vertrauenswürdiger Proxy: PocketBase läuft hinter Caddy. Ohne diese Einstellung
 *   sähe es alle Anfragen von 127.0.0.1 – Rate Limits träfen dann alle gemeinsam.
 *   Caddy setzt X-Forwarded-For auf die echte Adresse (die rechte ist die verlässliche).
 */
migrate((app) => {
  const settings = app.settings();
  settings.rateLimits.enabled = true;
  settings.trustedProxy.headers = ["X-Forwarded-For"];
  settings.trustedProxy.useLeftmostIP = false;
  app.save(settings);
}, (app) => {
  const settings = app.settings();
  settings.rateLimits.enabled = false;
  settings.trustedProxy.headers = [];
  app.save(settings);
});
