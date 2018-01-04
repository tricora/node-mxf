import fs from 'fs';
import BaseKLV from '../klv/BaseKLV';
import _ from 'highland';



export const parse = function (file) {
    return _(function(push, next) {
        const content = fs.readFileSync(file);
        console.log(content.length);
        let pos = 0;
        while (pos < content.length) {
            const klv = new BaseKLV(content.slice(pos), pos);
            // console.log(klv.toString());
            pos += klv.getTotalLength();
            push(null, klv);
        }
        console.log('processed:', pos, content.length);
        push(null, nil);
    });
}


export const splitKLV = function(stream) {
    let lastKLV;
    let byteCountInLastKLV = 0;
    let totalPosition = 0;
    return _.pipeline(_.consume((err, x, push, next) => {
        let position = 0;
        if (err) {
            push(err);
            next();
        } else if (x === _.nil) {
            push(null, x);
        } else {
            if (lastKLV) {
                lastKLV.append(x);
                if (lastKLV.isReady) {
                    push(null, lastKLV);
                    totalPosition = lastKLV.getTotalLength();
                    position = lastKLV.getTotalLength() - byteCountInLastKLV;
                    lastKLV = null;
                } else {
                    byteCountInLastKLV += x.length;
                    next();
                    return;
                }
            }
            while(position < x.length) {
                const klv = new BaseKLV(x.slice(position), totalPosition)
                if (klv.isReady) {
                    position += klv.getTotalLength();
                    totalPosition += klv.getTotalLength();
                    push(null, klv);
                } else {
                    lastKLV = klv;
                    byteCountInLastKLV = x.length - position;
                    break;
                }
            }
            next();
        }
    }));
}


