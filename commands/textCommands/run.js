import { prefixChange } from './prefixo.js';
import { freedomsCheck } from './freedoms.js';
import { dailyGrab } from './daily.js';

async function execute(message, client) {
  await prefixChange(message);
  await freedomsCheck(message, client);
  await dailyGrab(message);
};
export { execute };