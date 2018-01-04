import fs from 'fs';

const TIME_READ = 'time fs.read';
const TIME_STREAM = 'time stream';

export default function(file) {
    
    console.time(TIME_STREAM);
    const stream = fs.createReadStream(file);
    stream.on('data', (err, buf) => {

    });
    stream.on('end', () => {
        console.timeEnd(TIME_STREAM);
        
        console.time(TIME_READ);
        const size = fs.statSync(file).size;
        const fd = fs.openSync(file, 'r');
        let pos = 0;
        const buf = Buffer.allocUnsafe(1024 * 64);
        while(pos < size) {
            pos += fs.readSync(fd, buf, 0, buf.length);
        }
        fs.closeSync(fd);
        console.timeEnd(TIME_READ);
    });


}