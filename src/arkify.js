import set from 'lodash.set';
import leveldown from 'leveldown';
import levelup from 'levelup';
import InistArk from 'inist-ark';
import reduce from 'async/reduce';
import { resolve } from 'path';

/**
 * Take `Object` object, and throw the same object but with an ARK
 *
 * @param {String} [target=ark] field name to insert ARK
 * @param {String} [subpublisher] Subpublisher
 * @param {String} [naan] NAAN
 * @returns {Object}
 */
export default function arkify(data, feed) {
    const target = this.getParam('target', 'ark');
    const database = resolve(this.getParam('database', './database.ark'));
    const subpublisher = this.getParam('subpublisher');
    const naan = this.getParam('naan');

    if (!naan) {
        throw new Error('NAAN no set');
    }

    if (!subpublisher) {
        throw new Error('Subpublisher no set');
    }

    if (!database) {
        throw new Error('No location for ARK database');
    }

    if (!this.db) {
        this.db = levelup(leveldown(database));
    }

    if (this.isLast()) {
        this.db.close();
        return feed.close();
    }

    if (!this.ARK) {
        this.ARK = new InistArk({ naan, subpublisher });
    }

    return reduce([1, 2, 3], null, (memo, item, callback) => {
        if (memo) {
            return callback(null, memo);
        }
        const ark = this.ARK.generate();
        return this.db.get(ark, (errGet, val) => {
            if (!errGet && val) {
                return callback(null, false);
            }
            return callback(null, ark);
        });
    }, (errReduce, ark) => {
        if (errReduce) {
            return feed.stop(new Error('Unable to generate an ARK unique identifier after 3 attempts.'));
        }
        return this.db.put(ark, true, (errPut) => {
            if (errPut) {
                return feed.stop(errPut);
            }
            set(data, target, ark);
            return feed.send(data);
        });
    });
}
