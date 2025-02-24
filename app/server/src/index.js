const path = require( 'path' );

const express = require('express');
const cors = require('cors');
// const helmet = require('helmet');
// eslint-disable-next-line no-unused-vars
const dbClientInstance_ = require('./db/mongo.js');
const todoRoutes = require('./routes/todo');
const { metricRoutes, httpRequestMetric } = require('./routes/metrics');
const userRoutes = require('./routes/user');
const errorRoutes = require('./routes/error');
const envRoute = require('./routes/env.js');
let cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: `http://localhost:${ port }`,
    credentials: true
};

app.use(express.json());
app.use(cors(corsOptions));

app.use(cookieParser());

/*
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self' 'unsafe-inline'"],
        scriptSrc: ["'self' 'unsafe-inline' 'unsafe-eval'"]
    }
}));
*/

app.use(function(req, res, next) {
    const end = httpRequestMetric.startTimer();
    next();
    end({ 
        route: req.url, 
        code: res.statusCode, 
        methods: req.method
    });
});

app.use(todoRoutes);
app.use(metricRoutes);
app.use(userRoutes);
app.use('/', express.static(path.join(__dirname, `../public`)));
// IMPORTANT: Educational purpose only! Possibly exposes sensitive data.
app.use(envRoute);
// NOTE: must be last one, because is uses a wildcard (!) that behaves aa
// fallback and catches everything else
app.use(errorRoutes);

(async function main(){
    try{
        await new Promise( (__ful, rej__ )=>{
            app.listen(port, function(){
                console.log( `ToDo server is up on port ${ port }`);
                __ful();
            }).on( 'error', rej__);
        });

        process.on( 'SIGINT', ()=>{
            process.exit( 2 );
        });
    }catch( err ){
        console.error( err );
        process.exit( 1 );
    }
})();
