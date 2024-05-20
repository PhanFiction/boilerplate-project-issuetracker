const issueModel = require('../models/issue');

'use strict';
module.exports = function (app) {

  app.route('/api/issues/:project')
  
  .get(async function (req, res) {
    let project = req.params.project;
    const { open, _id, issue_title, issue_text, created_by, assigned_to, status_text } = req.query;

    const issueParams = {
      open,
      _id,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      projectName: project,
    };

    // Remove undefined values from the query object
    const query = {};
    for (const key in issueParams) {
      if (issueParams[key] !== undefined) {
        query[key] = issueParams[key];
      }
    }

    // Perform the query
    try {
      const foundIssue = await issueModel.find(query);
/*       console.log('Project name is', project, query);
      console.log(foundIssue);
 */
      if (!foundIssue.length) return res.json({ error: 'Not found' });

      return res.json(foundIssue);
    } catch (err) {
      console.error(err);
      return res.json('Failed to fetch data');
    }
  })
    
    .post(async function (req, res){
      let project = req.params.project;
      const { issue_text, issue_title, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) return res.json({ error: 'required field(s) missing' });
      
      console.log(
        'text ', issue_text, 
        'title ', issue_title, 
        'assigned to ', assigned_to, 
        'created by ', created_by, 
        'status ', status_text
      );

      const issue = {
        issue_text: issue_text,
        issue_title: issue_title,
        created_by: created_by,
        assigned_to: assigned_to || "",
        status_text: status_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        projectName: project,
      }

      try {
        const newIssue = new issueModel(issue);
        const savedIssue = await newIssue.save();
        //if (!savedIssue) return res.json({ error: 'failed to save' });
  
       // console.log('saved issue ', savedIssue);
        return res.json(savedIssue);
      } catch(error) {
        return res.json({ error: 'error saving data' });
      }
    })
    
    .put(async function (req, res) {
      let project = req.params.project;
      const { _id, issue_text, issue_title, assigned_to, created_by, status_text, open } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      if (!issue_text && !issue_title && !assigned_to && !created_by && !status_text && open === undefined) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      const updateFields = {
        updated_on: new Date()
      };

      if (issue_text != undefined) updateFields.issue_text = issue_text;
      if (issue_title != undefined) updateFields.issue_title = issue_title;
      if (assigned_to != undefined) updateFields.assigned_to = assigned_to;
      if (created_by != undefined) updateFields.created_by = created_by;
      if (status_text != undefined) updateFields.status_text = status_text;
      if (open != undefined) updateFields.open = open;

      try {
        const updatedIssue = await issueModel.findByIdAndUpdate(
          _id,
          { $set: updateFields },
          { new: true }
        );

        if (!updatedIssue) return res.json({ error: 'could not update', '_id': _id });

        return res.json({ result: 'successfully updated', _id });
      } catch (error) {
        console.error(error);
        return res.json({ error: 'could not update', '_id': _id });
      }
    })
    
    .delete(async function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      try {
        const deletedIssue = await issueModel.findByIdAndDelete(_id);

        if (!deletedIssue) return res.json({ error: 'could not delete', _id });

        return res.json({ result: 'successfully deleted', _id });
      } catch (error) {
        console.error(error);
        return res.json({ error: 'could not delete', _id });
      }
    });
    
};
