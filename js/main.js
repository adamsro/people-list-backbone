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

  PeopleList.Person = Backbone.Model.extend();

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
    model: PeopleList.Person,
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
    /*
     * PeopleListly a filter to the collection. Expected format:
     * {
     *  "city": "hollywood",
     *  "state": "ca"
     * }
    */
    filter: function(filter) {
      console.log(true);
      // return this.where({done: true});
    }
  });

  PeopleList.Filter = Backbone.Model.extend();

  PeopleList.FilterCollection = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: PeopleList.Filter,

    // Filter down the list of all todo items that are finished.
    getCriteria: function() {
      return this.where({enabled: true});
    },
  });

  PeopleList.FilterView = Backbone.View.extend({
    className: "form-check form-check-inline",
    // Cache the template function for a single item.
    template: _.template($("#person-filter-tpl").html()),

    // The DOM events specific to an item.
    events: {
      "click .form-check-input" : "toggleFilter",
    },

    toggleFilter: function() {
      this.model.set("enabled", !this.model.get("enabled"));
      PeopleList.trigger("filtertoggle", this.getCriteria);
    },

    // Turn the Person model into HTML and add it to our wrapping element.
    render: function() {
      return this.$el.html(this.template(this.model.attributes));
    }
  });

  /**
   * Represents the List of People with filters
   */
  PeopleList.TableView = Backbone.View.extend({
    el: '#persons-list',
    filterEl: '#filters-list',

    initialize: function() {
      this.listenTo(PeopleList.people, 'all', this.peopleRender);
      this.listenTo(PeopleList.filters, 'add', this.filtersRender);
      PeopleList.on("filtertoggle", this.filterPeople, this);
    },

    filterPeople: function(criteria) {
      PeopleList.people.filter(criteria);
    },

    peopleRender: function() {
      this.$el.html(PeopleList.people.map(function(person) {
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
    new PeopleList.TableView();

    /* Add our initial data  - this will trigger a render */
    PeopleList.people.set(bootstrapData.persons);
    PeopleList.filters.set(bootstrapData.filters);
  };

  _.extend(PeopleList, Backbone.Events);

  window.PeopleList = PeopleList;

})(this, Zepto);
