import { dataGenerate } from './data-generator.js';
import { table } from './table.js';
import { arrExtend, listen, uint32ArrayWithNumbers } from './utils.js';

/** Indexes in {data} to display. Used for filtering and sorting */
const rowsToDisplay = { r: uint32ArrayWithNumbers(1_000_000) };
const data = dataGenerate(500, 20);

const worker = new Worker(new URL('worker.js', import.meta.url), { type: 'module' });
listen(worker, 'message', /** @param {MessageEvent<any[][]>} evt */ evt => arrExtend(data, evt.data));
worker.postMessage([0, data, 999_500, 20]);

table(
	// headerDiv
	/** @type {HTMLDivElement} */(document.getElementById('hdr')),
	// colRowNumDiv
	/** @type {HTMLDivElement} */(document.getElementById('nums')),
	// tableDiv
	/** @type {HTMLDivElement} */(document.getElementById('tbl')),
	// rowHeight
	48,
	// cell wifth
	250,
	// cols
	['Name', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
	// rowsCount
	1000000,
	// rowsData
	data,
	// rowsToDisplay
	rowsToDisplay
);
