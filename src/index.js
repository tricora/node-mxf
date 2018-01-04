import { parse, splitKLV } from './parsing/Parser';
import fs from 'fs';
import int53 from 'int53';
import _ from 'highland';
import compare from './performance/fsReadVsStream';

console.log('---------------------------------------------------------------------------------');


const smallFile = '/home/tille/Downloads/freeMXF-mxf-dv-1.mxf';
const hugeFile = '/home/tille/workspace/data/mxf/Vantage_Telestream_DibLibrary_2014_49_137473.mxf';
const rlyHugeFile = '/home/tille/workspace/data/mxf/rlyHugeFile.mxf';

const start = new Date().getTime();
parse(hugeFile).each(x => undefined);
console.log(new Date().getTime() - start);

// const file = hugeFile;
// const size = fs.statSync(file).size;
// let num = 0;
// _(fs.createReadStream(file)).through(splitKLV()).each(() => num++).done(() => console.log(num, size, size / num));
