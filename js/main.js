/**
 * @file
 *   Retrieve a list of people from "/people" and a list of filters that act on the
 *   People collection from "/filters" then create a UI allowing a user to apply
 *   a filter to the people list.
 */

(function(window, $){
  'use strict';

  /* Namespace our application for later assignment to window */
  var PeopleList = {};

  /**
    * Build a DOM element to represent a Person
    * Represents a single person, e.g.
    * {
    *  "firstName": "Sam",
    *  "lastName": "Olsen",
    *  "streetAddress": "524 E Burnside",
    *  "city": "Portland",
    *  "state": "OR",
    *  "zip": "97214"
    * }
   */
  PeopleList.PersonView = Backbone.View.extend({
    // model: PeopleList.Person,
    // Cache the template function for a single item.
    template: _.template($("#person-tpl").html()),

    // Turn the Person model into HTML and add it to our wrapping element.
    render: function() {
      return this.template(this.model.attributes);
    }
  });

  /*
   * Represents a filterable group of people
  */
  PeopleList.PersonCollection = Backbone.Collection.extend({
    url: "/persons",
    /*
     * Apply a filter to the collection–join with `and`. Expected format:
    */
    whereLike: function(attrs){
      if (_.isEmpty(attrs)) return this;
      return this.filter(function(model) {
        for (var key in attrs) {
          if (model.get(key).toLowerCase().indexOf(attrs[key].toLowerCase()) === -1) {
           return false;
          }
        }
        return true;
      });
    },

  });

  PeopleList.FilterCollection = Backbone.Collection.extend({
    url: "/filters",
    /**
    * {
     *  "city": "hollywood",
     *  "state": "ca"
     * }
     */
    getCriteria: function() {
      return this.where({enabled: true}).reduce(function(list, obj){
        return _.extend(list, obj.attributes.criteria);
      }, {});
    },
    // Todos are sorted by their original insertion order.
    comparator: 'order'
  });

  PeopleList.FilterView = Backbone.View.extend({
    className: "form-check form-check-inline",
    // Cache the template function for a single item.
    template: _.template($("#person-filter-tpl").html()),

    // The DOM events specific to an item.
    events: {
      "click .form-check-input" : "toggleFilter",
    },

    initialize: function() {
      this.listenTo(this.model, 'all', this.peopleRender);
    },

    toggleFilter: function() {
      this.model.set("enabled", !this.model.get("enabled"));
      PeopleList.trigger("toggle:filter");
    },

    // Turn the Person model into HTML and add it to our wrapping element.
    render: function() {
      return this.$el.html(this.template(this.model.attributes));
    }
  });

  /**
   * Represents the List of People with filters
   */
  PeopleList.TableController = Backbone.View.extend({
    el: '#persons-list',
    filterEl: '#filters-list',

    initialize: function() {
      this.listenTo(PeopleList.people, 'update', this.peopleRender);
      this.listenTo(PeopleList.filters, 'add', this.filtersRender);
      PeopleList.on("toggle:filter", this.peopleRender, this);
    },

    peopleRender: function() {
      var peopleFiltered = PeopleList.people.whereLike(
        PeopleList.filters.getCriteria()
      );
      this.$el.html(peopleFiltered.map(function(person) {
        return new PeopleList.PersonView({model:person}).render();
      }));
      return this;
    },

    filtersRender: function() {
      // Attach our filters to the DOM
      $(this.filterEl).html(PeopleList.filters.map(function(filter) {
        return new PeopleList.FilterView({model:filter}).render();
      }, this));
      return this;
    }
  });

  PeopleList.run = function(bootstrapData) {
    /* Init our collection of people */
    PeopleList.people = new PeopleList.PersonCollection();
    PeopleList.filters = new PeopleList.FilterCollection();

    /* Setup our listeners */
    new PeopleList.TableController();

    /* Add our initial data  - this will trigger a render */
    PeopleList.filters.set(bootstrapData.filters);
    PeopleList.people.set(bootstrapData.persons);
  };

  _.extend(PeopleList, Backbone.Events);

  window.PeopleList = PeopleList;

})(this, Zepto);
