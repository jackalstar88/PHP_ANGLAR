<?php

class ReflectionClass {
    /* Constants */

    const IS_IMPLICIT_ABSTRACT = 16;
    const IS_EXPLICIT_ABSTRACT = 32;
    const IS_FINAL = 64;

    /* Properties */

    public $name;
    private $class;

    function __construct($argument) {
        if (is_string($argument)) {
            if (!class_exists($argument)) {
                throw new ReflectionException("Class " . $argument . " does not exist ");
            } else {
                $this->name = $argument;
            }
        }
    }

    public function getProperty($name) {
        $parts = explode("::", $name);
        
        if (count($parts) > 1) {
            new ReflectionMethod( $parts[ 0 ], $parts[ 1 ] );
        }
    }
    
    public function implementsInterface( $interface ) {
        if ( !interface_exists( $interface ) ) {
            throw new ReflectionException("Interface " . $interface . " does not exist ");
        }
        
        // todo add actual checking
    }
    
    public static function export($argument, $return = false) {
        
    }

    public function __toString() {
        
    }

}

?>