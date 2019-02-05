import assert from 'assert';
import InistArk from 'inist-ark';

import from from 'from';
import ezs from 'ezs';
import locals from '../src';

ezs.use(locals);

const ARK = new InistArk();
describe('tests', () => {
    it('examples', (done) => {
        let cnt = 0;
        from([
            { key: 'value' },
            { key: 'value' },
            { key: 'value' },
        ])
            .pipe(ezs('arkify', {
                naan: '12345',
                subpublisher: 'BCD',
            }))
            .on('data', (chunk) => {
                assert.ifError(chunk instanceof Error ? chunk : null);
                assert(chunk.ark);
                assert(ARK.validate(chunk.ark), true);
                cnt += 1;
                console.log({chunk});
            })
            .on('end', () => {
                assert(cnt === 3);
                done();
            });
    });
});
