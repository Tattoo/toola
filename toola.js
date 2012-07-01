var fs = require( "fs" );
var path = require( "path" );
var burrito = require( "burrito" );


function err( msg ){
  console.log( msg );
  process.exit( 1 );
}

function start( filePath ){

  fs.stat( filePath, function( error, stats ){

    if ( error ){
      err( error );
    }

    if ( stats.isDirectory() ){
      return traverse( filePath );
    }

    read( filePath );
  });
}

function read( file ){
  var content = fs.readFileSync( file, "utf-8" ); 
  burrito( burrito.parse( content, false, true ), function( node ){
    var name = node.name;
    var src = node.source();
    console.log( name + " " + src );
  });
}

function traverse( filePath ){  
  var files = fs.readdirSync( filePath );

  fs.readdir( filePath, function( files ){
    files.forEach(function( file ){
      var currentFile = path.join( filePath + "/" + file );

      if ( fs.statSync( currentFile ).isDirectory() ){
        traverse( currentFile );
      } 

      read( currentFile );
    });
  });
}

if ( process.argv.length < 3 ){
  err( "give path" );
}

fs.realpath( process.argv[ 2 ], function( error, path ){
  if ( error ){
    err( error );
  }

  start( filePath );
});
