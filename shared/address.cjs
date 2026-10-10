const extensions = new Set(['nex','vnt','zen','orb','kiv']);
function parseAddress(input) {
  const raw = input.trim();
  if (!raw || /[\\\s]/.test(raw) || (raw.includes('://') && !raw.startsWith('nexora://'))) throw new Error('Enter a Nexora address such as home.nex. Regular internet addresses are unavailable.');
  const url = new URL(raw.startsWith('nexora://') ? raw : `nexora://${raw}`);
  url.hostname = url.hostname.toLowerCase();
  const parts = url.hostname.split('.');
  if (url.username || url.password || url.port || parts.length !== 2 || !extensions.has(parts[1]) || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(parts[0])) throw new Error('Use a registered .nex, .vnt, .zen, .orb, or .kiv address.');
  return {host:url.hostname,address:url.hostname+url.pathname.replace(/^\/$/,'')+url.search+url.hash,url:url.href};
}
module.exports = {parseAddress};
