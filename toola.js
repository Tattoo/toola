var fs = require( "fs" );
var path = require( "path" );
var burrito = require( "burrito" );


function err( msg ){
  console.log( msg );
  process.exit( 1 );
}

function checkIfValidPath( error, stats ){
  if ( error ){
    err( error );
  }

  if ( !stats.isDirectory() ){
    err( "not a directory" );
  }
}

function traverse( filePath ){  

  var files = fs.readdirSync( filePath );

  files.forEach(function( file ){
    
    var currentFile = path.join( filePath + "/" + file );

    if ( fs.statSync( currentFile ).isDirectory() ){
      traverse( currentFile );
    } 

    var content = fs.readFileSync( currentFile, "utf-8" ); 
    burrito( burrito.parse( content, false, true ), function( node ){
      var name = node.name;
      var src = node.source();
      console.log( name + " " + src );
    });
  });

}

if ( process.argv.length < 3 ){
  err( "give path" );
}

var filePath = fs.realpathSync( process.argv[ 2 ] );

fs.stat( filePath, checkIfValidPath );

traverse( filePath );
