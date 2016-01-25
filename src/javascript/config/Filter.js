define([],function(){
    return {
        "String":[
            {name:"=",value:"eq"},
            {name:"!=",value:"ne"},
            {name:"exists",value:"exists"},
            {name:"start with",value:"start with"}
        ],
        "Number":[
            {name:">",value:"gt"},
            {name:">=",value:"gte"},
            {name:"<",value:"lt"},
            {name:"<=",value:"lte"},
            {name:"=",value:"eq"},
            {name:"!=",value:"ne"},
            {name:"exists",value:"exists"},
            {name:"not exists",value:"not exists"}
        ],
        "Boolean":[
            {name:"=",value:"eq"},
            {name:"exists",value:"exists"},
            {name:"not exists",value:"not exists"}
        ],
        "Date":[
            {name:"before",value:"before"},
            {name:"after",value:"after"},
            {name:"exists",value:"exists"},
            {name:"not exists",value:"not exists"}
        ],
        "File":[
            {name:"exists",value:"exists"},
            {name:"not exists",value:"not exists"}
        ],
        "GeoPoint":[
            {name:"exists",value:"exists"},
            {name:"not exists",value:"not exists"}
        ],
        "Array":[
            {name:"exists",value:"exists"},
            {name:"not exists",value:"not exists"},
            {name:"contains value",value:"contains"},
            {name:"does not contain value",value:"not contains"},
            {name:"contains one of",value:"in"},
            {name:"does not contain any of",value:"nin"}
        ],
        "Object":[
            {name:"exists",value:"exists"},
            {name:"not exists",value:"not exists"}
        ],
        "Pointer":[
            {name:"exists",value:"exists"},
            {name:"not exists",value:"not exists"}
        ],
        "ACL":[
            {name:"exists",value:"exists"},
            {name:"not exists",value:"not exists"}
        ]
    }
});