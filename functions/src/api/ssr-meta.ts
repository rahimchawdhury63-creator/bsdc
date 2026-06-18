import { onRequest } from 'firebase-functions/v2/https';
/** Crawler metadata endpoint foundation for SSR-like meta responses. */
export const ssrMeta = onRequest((_request, response) => { response.set('Cache-Control','public, max-age=600'); response.type('text/html').send('<!doctype html><html><head><title>BSDC</title><meta name="description" content="Bangladesh Software Development Community" /></head><body><div id="root"></div></body></html>'); });
