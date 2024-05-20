const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const issueModel = require('../models/issue');

chai.use(chaiHttp);
const api = '/api/issues/apitest';
suite('Functional Tests', function() {

  suite('Test POST', () => {
    test('Every form field filled out', (done) => {
      chai
      .request(server)
      .post(api)
      .set('content-type', 'application/json')
      .send({
        issue_title: 'Need to be addressed',
        issue_text: 'Authorization error',
        created_by: 'Bob',
        assigned_to: 'Jack Sparrow',
        status_text: 'Unable to fetch data',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Need to be addressed');
        assert.equal(res.body.issue_text, 'Authorization error');
        assert.equal(res.body.created_by, 'Bob');
        assert.equal(res.body.assigned_to, 'Jack Sparrow');
        assert.equal(res.body.status_text, 'Unable to fetch data');
        done();
      })
    })

    test('Certain fields filled out', (done) => {
      chai
      .request(server)
      .post(api)
      .set('content-type', 'application/json')
      .send({
        issue_title: 'Need to be addressed',
        issue_text: 'Authorization error',
        created_by: 'Bob',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Need to be addressed');
        assert.equal(res.body.issue_text, 'Authorization error');
        assert.equal(res.body.created_by, 'Bob');
        done();
      })
    })

    test('Missing fields', (done) => {
      chai
      .request(server)
      .post(api)
      .set('content-type', 'application/json')
      .send({
        issue_title: 'Need to be addressed',
        issue_text: null,
        created_by: null,
      })
      .end((err, res) => {
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      })
    })

  })

  suite('Test GET', () => {
    test('Get all issues from project', (done) => {
      chai
      .request(server)
      .get(api)
      .query({})
      .end((err, res) => {
        const body = res.body[0];
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'is array');
        assert.property(body, 'assigned_to');
        assert.property(body, 'status_text');
        assert.property(body, 'open');
        assert.property(body, 'issue_title');
        assert.property(body, 'issue_text');
        assert.property(body, 'created_by');
        assert.property(body, 'created_on');
        assert.property(body, 'updated_on');
        done()
      })
    })

    test('Get issue but with one filter', (done) => {
      chai
      .request(server)
      .get(api)
      .query({ created_by: 'Bob'})
      .end((err, res) => {
        assert.isArray(res.body, 'body contains array');
        // iterate through each array and see if the issue has created_by property
        res.body.forEach(issue => assert.equal(issue.created_by, 'Bob'));
        done();
      })
    })

    test('Get issue but with two filters', (done) => {
      chai
      .request(server)
      .get(api)
      .query({ created_by: 'Bob', open: true})
      .end((err, res) => {
        assert.isArray(res.body, 'body contains array');
        // iterate through each array and see if the issue has created_by property
        res.body.forEach(issue => {
          assert.equal(issue.created_by, 'Bob');
          assert.equal(issue.open, true);
        });
        done();
      })
    })

    test('Get issue but with three filters', (done) => {
      chai
      .request(server)
      .get(api)
      .query({ created_by: 'Bob', assigned_to: 'Jack Sparrow', open: true})
      .end((err, res) => {
        assert.isArray(res.body, 'body contains array');
        // iterate through each array and see if the issue has created_by property
        res.body.forEach(issue => {
          assert.equal(issue.created_by, 'Bob');
          assert.equal(issue.open, true);
          assert.equal(issue.assigned_to, 'Jack Sparrow');
        });
        done();
      })
    })
  })

  suite('Test PUT', () => {
    test('Update a single field', async () => {
      const foundIssue = await issueModel.find({});
      chai
      .request(server)
      .put(api)
      .send({ _id: foundIssue[0]._id, assigned_to: 'Captain Falcon'})
      .end((err, res) => {
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, foundIssue[0]._id);
      })
    })

    test('Update multiple fields', async () => {
      const foundIssue = await issueModel.find({});
      chai
      .request(server)
      .put(api)
      .send({_id: foundIssue[0]._id, issue_title: 'API is broken', issue_text: 'Deployment issue'})
      .end((err, res) => {
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, foundIssue[0]._id);
      })
    })

    test('Missing _id', (done) => {
      chai
      .request(server)
      .put(api)
      .send({})
      .end((err, res) => {
        assert.equal(res.body.error, 'missing _id');
        done();
      })
    })

    test('With no fields to update', async () => {
      const foundIssue = await issueModel.find({});
      chai
      .request(server)
      .put(api)
      .send({ _id: foundIssue[0]._id })
      .end((err, res) => {
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.equal(res.body._id, foundIssue[0]._id);
      })
    })

    test('Invalid id', (done) => {
      chai
      .request(server)
      .put(api)
      .send({ _id: '12345abc', issue_text: 'Problem' })
      .end((err, res) => {
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body._id, '12345abc');
        done();
      })
    })

  })

  suite('Test DELETE', () => {
    test('Delete a issue', async () => {
      const foundIssue = await issueModel.find({});
      chai
      .request(server)
      .delete(api)
      .send({ _id: foundIssue[0]._id })
      .end((err, res) => {
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, foundIssue[0]._id);
      })
    })

    test('Fail to delete issue with missing id', (done) => {
      chai
      .request(server)
      .delete(api)
      .send({_id: '12345abc'})
      .end((err, res) => {
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, '12345abc');
          done()
      })
    })
  })

});
