import { prefixChange } from './prefixo.js';
import { freedomsCheck } from './freedoms.js';
import { dailyGrab } from './daily.js';

async function execute(message) {
  await prefixChange(message);
  await freedomsCheck(message);
  await dailyGrab(message);
};
export { execute };