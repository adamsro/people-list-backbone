/**
 * @file
 *   Retrieve a list of people from "/people" and a list of filters that act on the
 *   People collection from "/filters" and create a UI allowing a user to apply
 *   a filter to the people list.
 */

(function(window, $){
  'use strict';

  // Namespace our application for later assignment to window.
  var PeopleList = {};

  /**
   * Build a DOM element to represent a Person. e.g.
   * {
   *  "firstName": "Sam",
   *  "lastName": "Olsen",
   *  "streetAddress": "524 E Burnside",
   *  "city": "Portland",
   *  "state": "OR",
   *  "zip": "97214"
   * }
   * return {string} HTML built from template
   */
  PeopleList.PersonView = Backbone.View.extend({
    // Cache the template function for a single item.
    template: _.template($("#person-tpl").html()),

    render: function() {
      return this.template(this.model.attributes);
    }
  });

  /*
   * Represents a filterable group of people
  */
  PeopleList.PersonCollection = Backbone.Collection.extend({
    // Endpoint used if more data exists then bootstrapped data.
    url: "/persons",

    /*
     * Run a case insensative filter on the collection which matches if every
     * criteria string given is a substring of the models equivalent key.
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
     * @return {object} flat list of all criteria.
     * {
     *  "lastName": "moss"
     *  "city": "hollywood",
     *  "state": "ca"
     * }
     */
    getCriteria: function() {
      return this.where({enabled: true}).reduce(function(list, obj){
        return _.extend(list, obj.attributes.criteria);
      }, {});
    },
  });

  PeopleList.FilterView = Backbone.View.extend({
    // Bootstrap classes needed for proper display.
    className: "form-check form-check-inline",
    // Cache the template function for a single item.
    template: _.template($("#person-filter-tpl").html()),

    // When the filter on/off checkbox is clicked...
    events: {
      "click .form-check-input" : "toggleFilter",
    },

   // Toggle the model. Selection of all enabled is in the collection.
    toggleFilter: function() {
      this.model.set("enabled", !this.model.get("enabled"));
      PeopleList.trigger("toggle:filter");
    },

    // Turn the Filter model into HTML and add it to our wrapping element.
    render: function() {
      return this.$el.html(this.template(this.model.attributes));
    }
  });

  /**
   * Represents the table of People with filters
   */
  PeopleList.TableController = Backbone.View.extend({
    el: '#persons-list',
    filterEl: '#filters-list',

    initialize: function() {
      this.listenTo(PeopleList.people, 'update', this.peopleRender);
      this.listenTo(PeopleList.filters, 'add', this.filtersRender);
      PeopleList.on("toggle:filter", this.peopleRender, this);
    },

    /**
     * Get filters, pass them into a new
     * @return {object} Instance of TableController
     */
    peopleRender: function() {
      var peopleFiltered = PeopleList.people.whereLike(
        PeopleList.filters.getCriteria()
      );
      this.$el.html(peopleFiltered.map(function(person) {
        return new PeopleList.PersonView({model:person}).render();
      }));
      return this;
    },

    /**
     * Build our filter templates and attach them to the DOM
     * @return {object} Instance of TableController
     */
    filtersRender: function() {
      $(this.filterEl).html(PeopleList.filters.map(function(filter) {
        return new PeopleList.FilterView({model:filter}).render();
      }, this));
      return this;
    }
  });

  PeopleList.run = function(bootstrapData) {
    // Init our collections of people and filters
    PeopleList.people = new PeopleList.PersonCollection();
    // Sort ascending alphabetical on last name.
    PeopleList.people.comparator = function(model) {
      return model.get("lastName");
    };
    PeopleList.filters = new PeopleList.FilterCollection();

    // Setup our listeners
    new PeopleList.TableController();

    // Add our initial bootstrap data  - this will trigger a render
    PeopleList.filters.set(bootstrapData.filters);
    PeopleList.people.set(bootstrapData.persons);
  };

  // Some triggers are attached to the PeopleList object so we need to add the
  _.extend(PeopleList, Backbone.Events);

  // Give public access to our App. Could be defined as AMD module as well.
  window.PeopleList = PeopleList;

})(this, Zepto);
