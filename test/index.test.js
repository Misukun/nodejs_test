const chai = require('chai');
const chaiHttp = require('chai-http');
const index = require('../src/index');

chai.should();
chai.use(chaiHttp);

describe('Index.js Test', () => {
    /**
     * Test the GET route
     */
    describe('GET /count Test', () => {
        it('It should GET the view /count', (done) => {
            chai.request(index)
                .get('/count')
                .end((err, resp) => {
                    resp.should.have.status(200);
                    resp.body.should.be.a('object');
                done();
                })
        });
    });



    /**
     * Test the POST route
     */
    describe('POST /track Test', () => {
        it('It should POST the increment in count', (done) => {
            const data = {
                body: {
                    count: "555",
                    reset: "false"
                }
            };
            chai.request(index)
                .post('/track')
                .type('form')
                .send(data)
                .then((resp) => {
                    // console.log(resp);
                    resp.should.have.status(200);
                    resp.body.should.be.a('object');
                    resp.body.should.have.property('count').eq("555");
                    resp.body.should.have.property('reset').eq("false");
                }).catch((err) => {
                    throw err
                });
                done();
        });
    });

});