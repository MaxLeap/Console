define([
    './Editors/Text',
    './Editors/Integer',
    './Editors/Date',
    './Editors/Boolean',
    './Editors/Fixed',
    './Editors/Array',
    './Editors/Object',
    './Editors/Pointer',
    './Editors/GeoPoint',
    './Editors/ACL',
    './Editors/Password',
    './Editors/File'
],function(Text,Integer,Date,Boolean,Fixed,Array,Object,Pointer,GeoPoint,ACL,Password,File) {

    return {
        Password:Password,
        Text:Text,
        Integer:Integer,
        Fixed:Fixed,
        Boolean:Boolean,
        Date:Date,
        Array:Array,
        Pointer:Pointer,
        Object:Object,
        GeoPoint:GeoPoint,
        ACL:ACL,
        File:File
    };
});
