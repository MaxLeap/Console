define([
        'basic/Object'
    ],
    function(CObject){
        var StateMachine = CObject.extend({
            initialize:function(){
                this._state = {};
                this._callback = {};
                return true;
            },
            register:function(start,condition,end,callback){
                if(!this._state[start])this._state[start] = {};
                this._state[start][condition] = end;
                if(!this._callback[start])this._callback[start] = {};
                this._callback[start][condition] = callback;
            },
            execute:function(condition,options){
                if(
                    !this.currentState
                    ||!this._callback[this.currentState]
                    ||!this._state[this.currentState]
                    ||!this._state[this.currentState][condition]
                ){
                    return false;
                }
                var callback = this._callback[this.currentState][condition];

                this.currentState = this._state[this.currentState][condition];
                return callback?callback(options):false;
            },
            setState:function(state){
                this.currentState = state;
            }
        });

        var ret = new StateMachine();

        if (ret.initialize() == false) {
            return false;
        }
        return ret;
    });