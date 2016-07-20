/* 
* @author Niklas von Hertzen <niklas at hertzen.com>
* @created 30.6.2012 
* @website http://hertzen.com
 */
PHP.Modules.prototype.$foreachInit = function( expr ) {
     
    var COMPILER = PHP.Compiler.prototype,
    VAR = PHP.VM.Variable.prototype,
    ARRAY = PHP.VM.Array.prototype;
    
    var itm = expr[ COMPILER.VARIABLE_VALUE ]; // trigger get
    
    if ( expr[ VAR.TYPE ] === VAR.ARRAY ) {
        var pointer = itm[ PHP.VM.Class.PROPERTY + ARRAY.POINTER];
        pointer[ COMPILER.VARIABLE_VALUE ] = 0;
      
        return {
            len: itm[ PHP.VM.Class.PROPERTY + ARRAY.VALUES ][ COMPILER.VARIABLE_VALUE ].length,
            expr: expr,
            clone: itm[ COMPILER.METHOD_CALL ]( this, COMPILER.ARRAY_CLONE )
        };
      
    } else if ( expr[ VAR.TYPE ] === VAR.OBJECT ) {
        var objectValue = itm;
        
        
        // iteratorAggregate implemented objects
        
        if ( objectValue[ PHP.VM.Class.INTERFACES ].indexOf("Traversable") !== -1 ) {
      
            var iterator = objectValue;
            
            if ( objectValue[ PHP.VM.Class.INTERFACES ].indexOf("Iterator") === -1 ) {
                iterator = objectValue[ COMPILER.METHOD_CALL ]( this, "getIterator" )[ COMPILER.VARIABLE_VALUE ];
            }
  
            iterator[ COMPILER.METHOD_CALL ]( this, "rewind" );

            return {
                expr: expr,  
                Class:iterator
            };
        } else {
            // public members in object
            
            var classProperty = PHP.VM.Class.PROPERTY;
            
            return {
                expr: expr,
                pointer: 0,
                keys:  (function( keys ) {
                    var items = [];
                    
                    keys.forEach( function( key ){
                        if ( key.substring(0, classProperty.length ) === classProperty) {
                            items.push( key.substring( classProperty.length ) );
                        } 
                    });
                    
                    return items;
                })(Object.keys ( objectValue ))
                
            };
            
        }
    } else {
        this[ COMPILER.ERROR ]( "Invalid argument supplied for foreach()", PHP.Constants.E_CORE_WARNING, true );
     
    }
   
};

PHP.Modules.prototype.$foreachEnd = function( iterator ) {
    
    var COMPILER = PHP.Compiler.prototype;
    
    // destruct iterator
    if ( iterator !== undefined && iterator.Class !== undefined ) {
        iterator.Class[ COMPILER.CLASS_DESTRUCT ]();
    }
 
};

PHP.Modules.prototype.foreach = function( iterator, byRef, value, key ) {
   
    var COMPILER = PHP.Compiler.prototype,
    VAR = PHP.VM.Variable.prototype,
    ARRAY = PHP.VM.Array.prototype,
    expr;

    if ( iterator === undefined  || iterator.expr === undefined ) {
        return false;
    }
    expr = iterator.expr;
    
    if ( iterator.count === undefined ) {
        iterator.count = 0;
    }
    
    if ( expr[ VAR.TYPE ] === VAR.ARRAY ) {
        
       
        
        /*
        if ( iterator.expr[ VAR.IS_REF ] !== true ) {
            expr = iterator.clone;
        } else {
            expr = expr[ COMPILER.VARIABLE_VALUE ];
        }
        */
        var clonedValues = iterator.clone[ PHP.VM.Class.PROPERTY + ARRAY.VALUES ][ COMPILER.VARIABLE_VALUE ],
        clonedKeys =  iterator.clone[ PHP.VM.Class.PROPERTY + ARRAY.KEYS ][ COMPILER.VARIABLE_VALUE ],
        origValues = expr[ COMPILER.VARIABLE_VALUE ][ PHP.VM.Class.PROPERTY + ARRAY.VALUES ][ COMPILER.VARIABLE_VALUE ],
        origKeys = expr[ COMPILER.VARIABLE_VALUE ][ PHP.VM.Class.PROPERTY + ARRAY.KEYS ][ COMPILER.VARIABLE_VALUE ],
        len = ( byRef === true || iterator.expr[ VAR.IS_REF ] === true ) ? origValues.length : iterator.len,
        pointer = (( byRef === true ) ? expr[ COMPILER.VARIABLE_VALUE ] : iterator.clone )[ PHP.VM.Class.PROPERTY + ARRAY.POINTER];
     
     
        // clean unset elements off array
        /*
        if ( byRef === true ) {
            origValues.forEach(function( variable, index ) {
                if ( variable[ VAR.DEFINED ] !== true ) {
                    origValues.splice( index, 1 );
                    origKeys.splice( index, 1 );
                    console.log(origValues);
                }
            });
        }*/

        var compareTo = (byRef === true || iterator.expr[ VAR.IS_REF ] === true)  ? origValues : clonedValues,
        result;
        
                    
            var index, lowerLoop = function( index ) {
                while( compareTo [ --index ] === undefined && index > 0 ) {}
                return index;
            }
            
           
            if ( pointer[ COMPILER.VARIABLE_VALUE ] !== iterator.count ) {
                
                if ( compareTo [ iterator.count ] !== undefined ) {
                    index = iterator.count;
                } else if ( compareTo [ pointer[ COMPILER.VARIABLE_VALUE ] ] !== undefined ) {
                    index = pointer[ COMPILER.VARIABLE_VALUE ];
                } else {
                    index =  lowerLoop( pointer[ COMPILER.VARIABLE_VALUE ] );     
                }
                       
            } else if ( compareTo [ iterator.count ] !== undefined ){
                index = iterator.count;
            } else {
                index =  lowerLoop( pointer[ COMPILER.VARIABLE_VALUE ] );    
            }
            
       
        
        if ( byRef === true || iterator.expr[ VAR.IS_REF ] === true) {
            result = ( origValues[ pointer[ COMPILER.VARIABLE_VALUE ] ] !== undefined && (iterator.count <= origValues.length || iterator.diff || iterator.first !== origValues[ 0 ]) );
        } else {
            result = ( clonedValues[ iterator.count ] !== undefined );
        }
        
        iterator.first = origValues[ 0 ];
              iterator.diff = (iterator.count === origValues.length);
       
        
        if ( result === true ) {
            


            
            if ( byRef === true || iterator.expr[ VAR.IS_REF ] === true ) {
                value[ VAR.REF ]( origValues[ index ] );
            } else {
                value[ COMPILER.VARIABLE_VALUE ] = clonedValues[ iterator.count ][ COMPILER.VARIABLE_VALUE ];
            }
            if ( key instanceof PHP.VM.Variable ) {
                if (byRef === true || iterator.expr[ VAR.IS_REF ] === true ) {
                    key[ COMPILER.VARIABLE_VALUE ] = origKeys[ index ];
                } else {
                    key[ COMPILER.VARIABLE_VALUE ] = clonedKeys[ index ];
                }
              
            }
            /*
            if (!byRef && iterator.expr[ VAR.IS_REF ] !== true ) {
                iterator.expr[ COMPILER.VARIABLE_VALUE ][ PHP.VM.Class.PROPERTY + ARRAY.POINTER][ COMPILER.VARIABLE_VALUE ]++;
            }*/
            iterator.prev = origValues[ index ];
            iterator.count++;
            
            expr[ COMPILER.VARIABLE_VALUE ][ PHP.VM.Class.PROPERTY + ARRAY.POINTER][ COMPILER.VARIABLE_VALUE ]++;
            iterator.clone[ PHP.VM.Class.PROPERTY + ARRAY.POINTER][ COMPILER.VARIABLE_VALUE ]++;
        // pointer[ COMPILER.VARIABLE_VALUE ]++;

        }
        
        return result;
        
        
        
  
    } else if ( expr[ VAR.TYPE ] === VAR.OBJECT ) {
        var objectValue = expr[ COMPILER.VARIABLE_VALUE ]
        

        // iteratorAggregate implemented objects
        if ( objectValue[ PHP.VM.Class.INTERFACES ].indexOf("Traversable") !== -1 ) {

            if ( byRef === true ) {
                this.ENV[ PHP.Compiler.prototype.ERROR ]( "An iterator cannot be used with foreach by reference", PHP.Constants.E_ERROR, true );
            }
           
            
            if ( iterator.first === undefined ) {
                iterator.first = true;
            } else {
                iterator.Class[ COMPILER.METHOD_CALL ]( this, "next" );
            }
            
            var result = iterator.Class[ COMPILER.METHOD_CALL ]( this, "valid" )[ VAR.CAST_BOOL ][ COMPILER.VARIABLE_VALUE ];
            
            if ( result === true ) {
                
                value[ COMPILER.VARIABLE_VALUE ] = iterator.Class[ COMPILER.METHOD_CALL ]( this, "current" )[ COMPILER.VARIABLE_VALUE ];
                
                if ( key instanceof PHP.VM.Variable ) {
                    key[ COMPILER.VARIABLE_VALUE ] = iterator.Class[ COMPILER.METHOD_CALL ]( this, "key" )[ COMPILER.VARIABLE_VALUE ];
                }
            }

            return result;
        
        } else {
            // loop through public members
            
            value[ COMPILER.VARIABLE_VALUE ] = objectValue[ PHP.VM.Class.PROPERTY + iterator.keys[ iterator.pointer ]];
            
            if ( key instanceof PHP.VM.Variable ) {
                key[ COMPILER.VARIABLE_VALUE ] =  iterator.keys[ iterator.pointer ];
            }
            
            return ( iterator.pointer++ < iterator.keys.length);
           
        }
        
       
    } else {
        this[ COMPILER.ERROR ]( "Invalid argument supplied for foreach()", PHP.Constants.E_CORE_WARNING, true );
        return false;
    }
    
    
    
};