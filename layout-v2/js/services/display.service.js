// display.service.js
// Display class
class Display {
  constructor(chartConfigs, sectionSelector) {
    // Set up objects to handle charts
    this.chartConfigs = chartConfigs;
    this.plots = [];

    // Set sections CSS class identifier
    this.sections = sectionSelector;

    // Instantiate helper classes
    this.queue = new Queue();
    this.scroller = new Scroller();

    // Kick off the Display class initialization methods
    this.init();
  }

  init() {
    // Call Display set up methods
    this.initScroller();
    this.initVisContainer();
    this.assignSVGsToCharts();
    this.loadData();

    // Listen for the sectionChange event
    document.addEventListener('sectionChange', () => {
      this.handleLayoutEvent();
    });

    // Listen for the windowResize event
    document.addEventListener('windowResize', () => {
      this.handleLayoutEvent();
    });
  }

  initScroller() {
    // Get sections for the scroller
    const sections = d3.selectAll(this.sections);

    // Initialize scroller with sections
    this.scroller.init(sections);
  }

  initVisContainer() {
    // Method creates SVG objects to append the charts to
    const container = this;
    console.log(this.constructor.name, 'initializing visualization container');

    // Define chart containers
    container.brush = d3.select('#vis-brush');
    container.chartPrimary = d3.select('#vis-focus-primary');
    container.chartSecondary = d3.select('#vis-focus-secondary');

    // Define dimensions
    container.margins = {
      top: 10, right: 10, bottom: 10, left: 10,
    };

    // Brush container
    container.brush.width = container.brush.node().offsetWidth - container.margins.left - container.margins.right;
    container.brush.height = container.brush.node().offsetHeight - container.margins.top - container.margins.bottom;

    // Primary chart container
    container.chartPrimary.width = container.chartPrimary.node().offsetWidth - container.margins.left - container.margins.right;
    container.chartPrimary.height = container.chartPrimary.node().offsetHeight - container.margins.top - container.margins.bottom;

    // Secondary chart container
    container.chartSecondary.width = container.chartSecondary.node().offsetWidth - container.margins.left - container.margins.right;
    container.chartSecondary.height = container.chartSecondary.node().offsetHeight - container.margins.top - container.margins.bottom;

    // Define SVG areas for each chart container
    // Brush
    container.brush.svg = container.brush
      .append('svg')
      .attr('width', container.brush.width + container.margins.left + container.margins.right)
      .attr('height', container.brush.height + container.margins.top + container.margins.bottom)
      .attr('class', 'vis-area');

    // chartPrimary
    container.chartPrimary.svg = container.chartPrimary
      .append('svg')
      .attr('width', container.chartPrimary.width + container.margins.left + container.margins.right)
      .attr('height', container.chartPrimary.height + container.margins.top + container.margins.bottom)
      .attr('class', 'vis-area');

    // chartSecondary
    container.chartSecondary.svg = container.chartSecondary
      .append('svg')
      .attr('width', container.chartSecondary.width + container.margins.left + container.margins.right)
      .attr('height', container.chartSecondary.height + container.margins.top + container.margins.bottom)
      .attr('class', 'vis-area');
  }

  assignSVGsToCharts() {
    // Class determines which SVG should receive each chart
    this.chartConfigs.forEach((chartConfig) => {
      const { visId } = chartConfig;

      // Assign each visualization to its corresponding svg container
      switch (visId) {
        case 'vis-brush':
          chartConfig.svg = this.brush.svg;
          break;
        case 'vis-focus-primary':
          chartConfig.svg = this.chartPrimary.svg;
          break;
        case 'vis-focus-secondary':
          chartConfig.svg = this.chartSecondary.svg;
          break;
        // We can add more cases for other visIds here if we need them
        default:
          // Handle cases for unknown visIds or add new mappings
          break;
      }
    });
  }

  loadData() {
    // Method sends the chart configs to the Queue class
    // Queue handles data loading and calls the chart constructor classes
    this.queue.loadData(this.chartConfigs)
      .then(() => {
        // Async callback completes when all the data has loaded
        // Returns a list of plot objects and step IDs, so we can
        // determine when to show each chart based on what step we're on
        this.plots = this.queue.plots;
        this.updateDisplay();
      })
      .catch((error) => {
        console.error('Error loading data:', error);
      });
  }

  updateDisplay() {
    const container = this;
    if (container.plots.length > 0) {
      // SCROLLING TEXT
      // Update text visibility for focused/unfocused sections
      d3.selectAll('.step')
        .style('opacity', (d, i) => (i === globalSectionIndex ? 1 : 0.3));

      // DIV CONTAINERS
      // Update brush div visibility for current section
      const plotsInBrush = container.plots.filter((plot) => plot.step
        === globalSectionIndex
        && plot.visId === 'vis-brush');

      if (plotsInBrush.length === 0) {
        // If no plots are found for the current globalSectionIndex
        // in the 'vis-brush' div, add the 'hidden' class
        container.brush.classed('hidden', true);
      } else {
        // If there are plots for the current globalSectionIndex
        // in the 'vis-brush' div, remove the 'hidden' class
        container.brush.classed('hidden', false);
      }

      // Update focus primary (short) vis div visibility for current section
      const plotsInPrimary = container.plots.filter((plot) => plot.step
        === globalSectionIndex
        && plot.visId === 'vis-focus-primary');

      if (plotsInPrimary.length === 0) {
        // If no plots are found for the current globalSectionIndex
        // in the 'vis-focus-primary' div, add the 'hidden' class
        container.chartPrimary.classed('hidden', true);
      } else {
        // If there are plots for the current globalSectionIndex
        // in the 'vis-focus-primary' div, remove the 'hidden' class
        container.chartPrimary.classed('hidden', false);
      }

      // Update focus secondary (tall) vis div visibility for current section
      const plotsInSecondary = container.plots.filter((plot) => plot.step
        === globalSectionIndex
        && plot.visId === 'vis-focus-secondary');

      if (plotsInSecondary.length === 0) {
        // If no plots are found for the current globalSectionIndex
        // in the 'vis-focus-primary' div, add the 'hidden' class
        container.chartSecondary.classed('hidden', true);
      } else {
        // If there are plots for the current globalSectionIndex
        // in the 'vis-focus-primary' div, remove the 'hidden' class
        container.chartSecondary.classed('hidden', false);
      }

      // CHARTS
      // Update plots visibility based on globalSectionIndex
      const plotsToActivate = this.plots.filter((plot) => plot.step === globalSectionIndex);
      const plotsToDeactivate = this.plots.filter((plot) => plot.step !== globalSectionIndex);

      // Activate plots matching globalSectionIndex
      plotsToActivate.forEach((plot) => {
        plot.plot.activate();
      });

      // Deactivate plots not matching globalSectionIndex
      plotsToDeactivate.forEach((plot) => {
        plot.plot.deactivate();
      });
    }
  }

  handleLayoutEvent() {
    // Check to make sure there are actually charts to display
    if (this.plots.length > 0) {
      // Update display text styles and charts based on the current step
      this.updateDisplay();
    }
  }
}
