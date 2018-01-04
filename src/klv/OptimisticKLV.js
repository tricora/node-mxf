import fs from 'fs';

function createKeyString(buffer) {
    return buffer.slice(0, 16).reduce((acc, cur) => {
        if (acc) {
            acc += '-';
        }
        return acc + (cur & 0xF0 ? '' : '0') + cur.toString(16);
    }, '')
}

export class OptimisticKLV {
    constructor() {
    
    }

    decodeBerLength(buffer) {
        if (buffer[16] & 0x80 === 0) {
            this.length = buffer[16];
            this.valueOffset = 17;
        } else {
            const lengthLength = buffer[16] & 0x7F;
            if (buffer.length < 17 + lengthLength) {
                return;
            }
            if (lengthLength > 6) {
                throw 'BER length byte num > 6';
            }
            this.length = buffer.readUIntBE(17, lengthLength);
            this.valueOffset = 17 + lengthLength;
        }
    }

    getTotalLength() {
        return this.valueOffset + this.length;
    }

    isComplete() {
        return this.buffer.length === this.length + this.valueOffset;
    }

    getKeyBuffer() {
        this.buffer.splice(0, 16);
    }

    getValue() {
        return this.buffer.slice(this.valueOffset);
    }

    load(fileDesc, cb) {
        const buf = Buffer.allocUnsafe(this.length);
        fs.read(fd, buf, 0, this.length, this.valueOffset, (err, bytesRead, buffer) => {
            if (err) {
                cb(err);
            } else {
                this.isComplete = true;
                this.value = buffer;
                cb();
            }
        });
    }

    toString() {
        return `{ key: ${this.key}, length: ${this.length}, previewSize: ${this.buffer.length - this.valueOffset} }`;
    }
}

export const createOptimisticKLV = function(buffer, offset) {

}