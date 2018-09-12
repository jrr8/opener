## Opener Skills Assessment
This repo contains all of the files for my Opener skills assessment.

1) The hand-drawn UI are included as images `list_page.jpeg` and `detail_page.jpeg`

2) I made four tables given in `database_tables.xlsx`. On the
`plan` table I left some commentary on my choice of design. I did
not include any explicit schema because the relations
between tables are fairly straightforward and can be gathered
from the column names of each table. Unfortunately I was not able
to code the tables as Django models as I am a Flask user and am more
familiar with NoSQL databases, and my school assignments were beckoning

3) My example data is included in each table of the `database_table.xlsx` spreadsheet

4) My documentation for the API is in `api.md`. For the `POST` request
for User information, I was slightly unsure on the precise nature
of the endpoint. I interpreted the given description of the endpoint
as an endpoint for writing user information in the database.

5) My SQL commands can be found in `sql.md`. Since I've been
working with NoSQL for the past year and a half, I had to brush up
on my SQL knowledge (of course, I can greatly improve my SQL knowledge
between now and January).

6) My python implementation of the database is in `db.py`. I commented
the code where appropriate, but the base idea is that the `_DataModel` class
is an abstract class of which each table in the database is a concrete subclass.
    * Note that in this implementation the "database" is started from
    scratch each time the program starts. Obviously a more robust design
    would be required in practice
    
7) My javascript implementation of the database is in `db.js`.
Since javascript is designed to be run on a page in a browser, that code
is more-or-less a sketch of what the production code would look like.

8) My permission requirements are in `permissions.md`

9) My email notification notes are in `emails.md`

10) `python_sample.py`, `javascript_sample.js`, and `css_sample.css` include my
code samples. I left a brief word at the beginning of each to quickly describe
the file.

## Closing
This was a fun assignment. I hope you enjoy my submission. Thank you for
considering me, and please let me know if you have any questions or would like to discuss
anything.