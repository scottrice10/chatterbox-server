// YOUR CODE HERE:

/////////////////////////////////////////////////////////////////////////////
// Backbone-based Implementation of chatterbox client
/////////////////////////////////////////////////////////////////////////////

var Message = Backbone.Model.extend({
  url: 'http://127.0.0.1:3000/classes/messages/',
  defaults: {
    username: ''
  }
});

var Messages = Backbone.Collection.extend({
  model: Message,
  url: 'http://127.0.0.1:3000/classes/messages/',

  loadMsgs: function() {
    this.fetch({
      data: {
        order: '-createdAt'
      }
    });
  },

  parse: function(response, options) {
    var results = [];
    for (var i = response.results.length - 1; i >= 0; i--) {
      results.push(response.results[i]);
    }
    return results;
  }
});

var FormView = Backbone.View.extend({

  initialize: function() {
    this.collection.on('sync', this.stopSpinner, this);
  },

  events: {
    'submit #send': 'handleSubmit'
  },

  handleSubmit: function(e) {
    e.preventDefault();

    this.startSpinner();

    var $text = this.$('#message');
    this.collection.create({
      username: window.location.search.substr(10),
      text: $text.val()
    });
    $text.val('');
  },

  startSpinner: function() {
    this.$('.spinner img').show();
    this.$('form input[type=submit]').attr('disabled', "true");
  },

  stopSpinner: function() {
    this.$('.spinner img').fadeOut('fast');
    this.$('form input[type=submit]').attr('disabled', null);
  }

});

var MessageView = Backbone.View.extend({

  template: _.template('<div class="chat" data-id="<%- objectId %>"> \
                       <div class="user"><%- username %></div> \
                       <div class="text"><%- text %></div> \
                       </div>'),

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this.$el;
  }

});

var MessagesView = Backbone.View.extend({

  initialize: function() {
    this.collection.on('sync', this.render, this);
    this.onscreenMessages = {};
  },

  render: function() {
    this.collection.forEach(this.renderMessage, this);
  },

  renderMessage: function(message) {
    if (!this.onscreenMessages[message.get('objectId')]) {
      var messageView = new MessageView({
        model: message
      });
      this.$el.prepend(messageView.render());
      this.onscreenMessages[message.get('objectId')] = true;
    }
  }

});
