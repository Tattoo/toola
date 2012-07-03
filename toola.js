var fs = require( "fs" );
var path = require( "path" );
var uglify = require("uglify-js");

function err( msg ){
  console.log( msg );
  process.exit( 1 );
}

function start( filePath ){
  if ( fs.statSync( filePath ).isDirectory() ){
    return traverse( filePath, {} );
  }

  return read( filePath, {} );
}

function makeAst( str ){
  var array = uglify.parser.parse( str, false, true );
  var ast = {};

  ast[ array[0] ] = array[ 1 ].map(function( item ){

    // you cannot do the following in JS:
    //    var key="foo", bar = { key: "something" }
    // as bar will be { "key": "something" }
    // hence, we do it this way
    var ret = {}; 
    ret[ item[0] ] = item.slice( 1 );
    return ret;
  });

  return ast;
}

function walkAst( ast, fn ){
  return recurAst( ast["toplevel"], fn );
}

function undefines( i ){ 
  return ( i !== undefined ); 
}

function read( file, result ){

  var collect = { "__somewhere_else__": [] }
  var content = fs.readFileSync( file, "utf-8" ); 
//  var ast = makeAst( content );
  var ast = uglify.parser.parse( content, false, true );
  var w = uglify.uglify.ast_walker();

  w.with_walkers({
      "defun": function( methodName ){
        collect[ methodName ] = [];
      }
    , "call": function( statement ,b,c,d ){
        if ( statement[ 0 ] === "dot" ){
          if ( statement[ 1 ][ 0 ] === "call"  ){
            var name = ( statement[1][1][1] === "$") ? "$()" : name; 
            //console.log( name + " " + statement[2]  );
          } else if ( statement[ 1 ][ 0 ] === "name"){
            //console.log( statement[1][1] + " " + statement[2]  );
          } else if ( statement[1][0] === "sub"  ){
            var sub = statement;
            var name = sub[1][1][1][1] + "[" + sub[1][1][2][1] + "]"
            var method = sub[2]
            //console.log(this[0].start.line + ": " + name + " " + method );
          }

        
          else {  
            var st = statement[1][0];
            console.log(this[0].start.line + ": " + statement.join("|") ); 
          }
        } 
    }
  }, function(){
    w.walk(ast);
  });

/*
  // collect method names from function definitions
  // filter out the undefines the map function leaves for non-definitions
  var methods = ast[ "toplevel" ].map( function( statement ){
    if ( statement.hasOwnProperty("defun") ){
      return statement[ "defun" ][0];
    }
  }).filter( undefines );

  methods.forEach(function( name ){ 
    collect[ name ] = []; 
  });
 
  result[ file ] = collect;

  return result;
*/
}

function traverse( filePath, result ){  
  var files = fs.readdirSync( filePath );

  fs.readdir( filePath, function( files ){
    files.forEach(function( file ){

      var currentFile = path.join( filePath + "/" + file );

      if ( fs.statSync( currentFile ).isDirectory() ){
        return traverse( currentFile, result );
      } 

      return read( currentFile, result );
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

  var result = start( path );
//  console.log( result );
});
