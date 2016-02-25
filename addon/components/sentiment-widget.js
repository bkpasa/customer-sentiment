import Ember from 'ember';
import layout from '../templates/components/sentiment-widget';

export default Ember.Component.extend({
  layout: layout,
  question: '',
  kibanaUrl: '',
  userInfo: '',

  comment: 'Tell us more...',
  showQuestion: false,
  yesClass:'',
  noClass:'',

  showNotes: Ember.computed('choice', function(){
    return (this.get('choice')!==null);
  }),
  choice: null,
  /*mouseEnter: function(event){
    var element = Ember.$(event.target).context;
   // if(element.className==='sentiment-icon'){
   //   this.set('showQuestion', true);
   // }
  },
  mouseLeave: function(event){
    //this.set('showQuestion', false);
  },*/
  click: function(event){
    var element = Ember.$(event.target).context;
    var elementClassName = element.className;
    var logKibana = false;
      if(element.className==='sentiment-icon' || element.className==='icon-cs-thumbsup sentiment'){
      this.set('showQuestion', true);
    }
    //if(this.get('choice')===null){//log to kibana only when it is null
      if(elementClassName==='icon-cs-thumbsup'){
        this.set('choice', true); 
        this.set('yesClass', 'inactive');
        this.set('noClass', 'active');
        logKibana=true;
      }else if(elementClassName==='icon-cs-thumbsdown'){
        this.set('choice', false);
        this.set('noClass', 'inactive');
        this.set('yesClass', 'active');
        logKibana=true;
      }
      if(logKibana){
        //log to Kibana
        var action = this.get('choice')? 'Like':'Dislike';
        this.container.lookup('global:main').logUserSentimentsQuestion({
                'action': action
            });
      }
    //}
  },
  resetComponent: function(){
    this.set('comment', 'Tell us more...');
    this.set('showQuestion', false);
    this.set('yesClass', '');
    this.set('noClass', '');
    this.set('choice', null);
  },
  userName: function() {
        var userInfo = this.get('userInfo');
        var nameElements = [];

        if(userInfo.firstName) {
            nameElements.push(userInfo.firstName);
        }
        if(userInfo.middleInitial) {
            nameElements.push(userInfo.middleInitial);
        }
        if(userInfo.lastName) {
            nameElements.push(userInfo.lastName);
        }
        var fullName = nameElements.join(' ');
        return fullName;
    },
    userId: function() {
        var userInfo = this.get('userInfo');
        return userInfo.userId;
    },
    customerCode: function(){
        var userInfo = this.get('userInfo');
        return userInfo.customerCode;
    },
    officeCode: function(){
        var userInfo = this.get('userInfo');
        return userInfo.officeCode;
    },
  //hashObject is nameValue pair, key is name and attribute value is the value
  logUserSentimentsQuestion: function(hashObject){
    var loggerUrl = this.get('kibanaUrl') + "?userName=" + this.userName() + "&userId=" + this.userId() + "&customerCode=" + this.customerCode() + "&officeCode=" + this.officeCode() + "&companyCode="+this.customerCode()+this.officeCode();
        for (var key in hashObject) {
            if (hashObject.hasOwnProperty(key)) {
                loggerUrl += '&' + key + '=' + hashObject[key];
            }
        }
        loggerUrl += '&eol=crlf';
        Ember.$.get(loggerUrl)
            .done(function() {
                //
            })
            .fail(function() {
                //
            });
  },
  actions:{
    cancelFeedback: function(){
      //kibana log
      this.logUserSentimentsQuestion({
                'action': 'cancelWidget'
            });
      this.resetComponent();
    },
    cancelSubmit: function(){
      //dont log this cancel
      this.resetComponent();
    },
    submit: function(){
      //kibana log
      var question = this.get('question');
      var action = this.get('choice')? 'Like':'Dislike';
      var comment = this.get('comment')==='Tell us more...'?'':this.get('comment');
      this.logUserSentimentsQuestion({
                'question': question,
                'action': action,
                'comment': comment
            });
      this.resetComponent();
    },
    onFocusOut: function(){
      if(this.get('comment')===''){
        this.set('comment', 'Tell us more...');
      }
    },
    onFocusIn: function(){
      if(this.get('comment')==='Tell us more...'){
        this.set('comment', '');
      }
    }
  }
});
