/*
    This is the javascript code for step 7) in the assignment. Unlike
    the python file which can be run in a python3 interpreter, this
    code is more bare-bones as I did not make a server to serve the
    data files and did not make any webpages that actually use this code.
    This serves as a sketch of what the code would look like if I were
    to actually use it an a live web app.
*/
class _DataModel {
    constructor(uid, data={}) {
        // Add a record for the supplied id if it does not exist already
        if (!this.db.hasOwnProperty(uid)) {
            this.db[uid] = {};
        }

        this.id = uid;

        // Add any data passed to the constructor to the db for the model
        if (data) {
            Object.assign(this.db, data)
        }
    }


    // These methods are wrappers around the class's database so that
    // you can call <instance>.get(field) rather than <instance>.db[this.id][field]
    get(field) {
        return this.db[this.id][field];
    }

    set(field, value) {
        this.db[this.id][field] = value
    }
}

// Adding static methods
_DataModel.prototype.addField = function(name, initialVal) {
    for (let row in this.db) {
        this.db[row][name] = initialVal
    }
};
_DataModel.prototype.loadSampleData = function(filename) {
    // For this method to work properly we'll need all of the files in /data
    // to be hosted on a web server and for this code to be executed in a browser,
    // so this code serves a sketch of what that would look like
    const req = new XMLHttpRequest();
    req.open('GET', '/data/' + filename);
    req.onload = () => {
        this.db = req.response;
    };
    req.send()
};


// Making subclasses
// All of the class properties shown in db.py will
// look the same here, so I've just included one property
// for each class to demonstrate what that would look like
// rather than re-write them all
class TestPlan extends _DataModel {
    workFlow() {
        return new WorkFlow(this.get('workflow'))
    }
}
TestPlan.prototype.db = {};

class WorkFlow extends _DataModel {
    print() {
        var msg = 'Stages for Workflow in plan "' + this.plan.title + '":\n';
        for (let stage in this.stages) {
            msg += stage === this.currentStage ? '  * ' : '    ';
            msg += stage.description + '\n'
        }
        msg += '\n("*" marks current stage)';
        return msg
    }

    stages() {
        const stageIds =  Object.keys(Stage.db).filter(id => Stage.db[id].workFlow === this.id);
        return stageIds.map(stageId => new Stage(stageId))
    }
}
WorkFlow.prototype.db = {};


class Stage extends _DataModel {
    workFlow() {
        return new WorkFlow(this.get('workflow'))
    }
}
Stage.prototype.db = {};

class User extends  _DataModel {
    name() {
        return this.get('first_name') + ' ' + this.get('last_name')
    }
}
User.prototype.db = {};



// Finally, read in the sample data
function loadSampleData() {
    TestPlan.prototype.loadSampleData('plans.csv');
    WorkFlow.prototype.loadSampleData('workflows.csv');
    Stage.prototype.loadSampleData('stages.csv');
    User.prototype.loadSampleData('users.csv');
}


