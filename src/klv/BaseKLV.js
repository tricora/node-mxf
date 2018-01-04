import fs from 'fs';

function createKeyString(buffer) {
    return buffer.slice(0, 16).reduce((acc, cur) => {
        if (acc) {
            acc += '-';
        }
        return acc + (cur & 0xF0 ? '' : '0') + cur.toString(16);
    }, '')
}

class BaseKLV {
    constructor(buffer, position = 0) {
        this.isReady = false;
        this.position = position;
        this.append(buffer);
    }

    append(buffer) {
        if (this.isReady) {
            throw 'cannot append to fully initialized KLV';
        }
        if (!this.buffer) {
            this.buffer = buffer;
        } else {
            this.buffer = Buffer.concat([this.buffer, buffer]);
        }

        if (this.buffer.length < 17) {
            return;
        }
        if (this.key === undefined) {
            this.key = createKeyString(buffer);
        }

        if (this.length === undefined) {
            this.decodeBerLength(this.buffer);
            if (this.length === undefined) {
                return;
            }
        }

        if (this.buffer.length < this.getTotalLength()) {
            return;
        }

        this.finishInitialization();
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

    finishInitialization() {
        /* important to prevent memory leaking of possible sliced buffer references */
        const copyLength = Math.min(this.length, 100) + this.valueOffset;
        const buf = Buffer.allocUnsafe(copyLength);
        this.buffer.copy(buf, 0, 0, copyLength);
        this.buffer = buf;

        this.isReady = true;
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


export default BaseKLV;