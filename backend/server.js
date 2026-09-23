const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const HTTP_PORT = process.env.PORT || 3333;

app.use(helmet());
app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({ status: 'Alive', service: 'Auctionary API' });
});

require('./app/routes/user.server.routes')(app);
require('./app/routes/core.server.routes')(app);
require('./app/routes/question.server.routes')(app);

app.use((req, res) => {
    res.sendStatus(404);
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error_message: 'Malformed JSON body' });
    }

    console.error(err);
    return res.status(500).json({ error_message: 'Internal server error' });
});

if (require.main === module) {
    app.listen(HTTP_PORT, () => {
        console.log('Server running on port: ' + HTTP_PORT);
    });
}

module.exports = app;
