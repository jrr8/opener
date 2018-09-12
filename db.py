"""
This is the python code for step 6) in the assignment. This should be
run in a python3 environment.
"""


class _DataModel:
    # This is an abstract class which all data models are concrete subclasses of.
    # Subclasses provide their own value for db, which mimics the relevant table
    # of the database.
    db = None

    def __init__(self, uid, data=None):
        if uid not in self.db:
            self.db[uid] = {}
        self.id = uid
        self.update(data)

    def __eq__(self, other):
        return self.__class__ == other.__class__ and self.id == other.id

    def get(self, field, default=None):
        return self.db[self.id].get(field, default)

    def set(self, field, value):
        self.db[self.id][field] = value

    def update(self, data):
        if not isinstance(data, dict):
            raise TypeError('Data passed to a DataModel subclass must be a dict')
        self.db[self.id].update(data)

    @classmethod
    def add_field(cls, field_name, initial_val=None):
        for row in cls.db:
            cls.db[row][field_name] = initial_val

    @classmethod
    def remove_field(cls, field_name):
        for row in cls.db:
            try:
                del cls.db[row][field_name]
            except KeyError:
                continue


class TestPlan(_DataModel):
    db = {}

    @property
    def work_flow(self):
        return WorkFlow(self.get('workflow'))

    @property
    def author(self):
        return self.get('author')

    @property
    def title(self):
        return self.get('title')

    @property
    def description(self):
        return self.get('description')

    @property
    def status(self):
        return self.get('status')

    @property
    def created(self):
        return self.get('created_date')

    @property
    def last_modified(self):
        return self.get('last_modified')


class WorkFlow(_DataModel):
    db = {}

    def __str__(self):
        ret_str = 'Stages for Workflow in plan "{}":\n'.format(self.plan.title)
        for stage in self.stages:
            ret_str += '  * ' if stage == self.current_stage else '    '
            ret_str += str(stage.description) + '\n'
        ret_str += '\n("*" marks current stage)'
        return ret_str

    @property
    def plan(self):
        return TestPlan(self.get('plan'))

    @property
    def risk_level(self):
        return self.get('risk_level')

    @property
    def stages(self):
        stages = [Stage(stage) for stage in Stage.db]
        return [stage for stage in stages if stage.work_flow.id == self.id]

    @property
    def num_stages(self):
        return len(self.stages)

    @property
    def num_rejections(self):
        return self.get('num_rejections', 0)

    @property
    def current_stage(self):
        approved = [stage for stage in self.stages if stage.is_approved]
        pending = [stage for stage in self.stages if not stage.is_approved]
        return pending[0] if pending else approved[-1]

    @property
    def is_complete(self):
        return self.current_stage == self.stages[-1]


class Stage(_DataModel):
    db = {}

    @property
    def work_flow(self):
        return WorkFlow(self.get('workflow'))

    @property
    def requires_approval_from(self):
        return self.get('requires_approval_from')

    @property
    def description(self):
        return self.get('description')

    @property
    def is_approved(self):
        return self.get('approved') == "TRUE"


class User(_DataModel):
    db = {}

    @property
    def position(self):
        return self.get('position')

    @property
    def clearance(self):
        return self.get('risk_clearance')

    @property
    def name(self):
        return self.get('first_name') + ' ' + self.get('last_name')


def load_file(filename):
    def extract_csv(string, skip_first=False):
        columns = string.replace('\n', '').split(',')
        return columns[1:] if skip_first else columns

    if not filename.endswith('.csv'):
        filename += '.csv'

    try:
        f = open('data/{}'.format(filename))
    except FileNotFoundError:
        return "No data found in data/{}".format(filename)

    return_data = {}
    fields = extract_csv(f.readline(), skip_first=True)

    for csv_line in f:
        line = extract_csv(csv_line)
        uid, values = line[0], line[1:]
        return_data[uid] = {fields[i]: values[i] for i in range(len(fields))}

    f.close()
    return return_data


def load_sample_data():
    classes_and_files = {
        TestPlan: 'plans.csv',
        WorkFlow: 'workflows.csv',
        Stage: 'stages.csv',
        User: 'users.csv'
    }
    for cls, file_name in classes_and_files.items():
        load_attempt = load_file(file_name)
        if isinstance(load_attempt, dict):
            cls.db = load_attempt
        else:
            print(load_attempt)


load_sample_data()
wf = WorkFlow('2004')
print(wf)
