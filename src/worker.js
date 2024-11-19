import { dataGenerate } from './data-generator.js';
import { arrExtend, arrForEachChunk, wait } from './utils.js';

const data = [];

/** @param {MessageEvent<InitMessageData & FilterMessageData>} evt */
onmessage = async function (evt) {
	switch (evt.data[0]) {
		case 1: await filter(evt.data[1]); break;
		case 0: dataInit(evt.data[1], evt.data[2], evt.data[3]); break;
	}
};

/** @param {any[][]} initData, @param {number} rowsCount, @param {number} colCount */
const dataInit = (initData, rowsCount, colCount) => {
	const CHUNK_SIZE = 10000;

	arrExtend(data, initData);
	const post = /** @param {number} rwCount */ rwCount => {
		const chunkData = dataGenerate(rwCount, colCount);
		postMessage([0, chunkData]);
		arrExtend(data, chunkData);
	};

	const chunkFullCount = Math.trunc(rowsCount / CHUNK_SIZE);
	for (let ii = 0; ii < chunkFullCount; ii++) {
		post(CHUNK_SIZE);
	}
	post(rowsCount - chunkFullCount * CHUNK_SIZE);
};

/** @type {string} */
let _str = null;

/** @param {string} str */
const filter = async str => {
	_str = str;

	const rowsToDisplay = [];
	const post = () => {
		const arr = new Uint32Array(rowsToDisplay);
		// @ts-ignore
		self.postMessage([1, arr], [arr.buffer]);
	};

	let postedRowsCount = 0;

	/** @param {any[]} row, @param {number} index */
	let forEachCallBack = (row, index) => {
		const search = () => {
			if (row[0]?.toLocaleLowerCase().indexOf(str) !== -1) {
				rowsToDisplay.push(index);
				return true;
			}
			return false;
		};

		if (search()) {
			// first 100 found
			if (rowsToDisplay.length === 100) {
				postedRowsCount = rowsToDisplay.length;
				post();
				forEachCallBack = () => search();
			}
		} else if (index === 5_000 && rowsToDisplay.length === 0) {
			post();
			forEachCallBack = () => search();
		}
	};

	await arrForEachChunk(
		data,
		// chunkSize
		5_000,
		// forEachCallBack
		(row, index) => forEachCallBack(row, index),
		// chunkEndCallBack
		async () => {
			await wait(); // let other tasks go
			if (_str !== str) { return false; }

			if (postedRowsCount !== rowsToDisplay.length) {
				postedRowsCount = rowsToDisplay.length;
				post();
			}

			return true;
		}
	);
};

/**
@typedef {[0, any[][], number, number]} InitMessageData
@typedef {[0, any[]]} InitResponceMessageData

@typedef {[1, string]} FilterMessageData
@typedef {[1, Uint32Array]} FilterResponceMessageData
*/
