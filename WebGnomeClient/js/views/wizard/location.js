define([
    'jquery',
    'underscore',
    'backbone',
    'sweetalert',
    'views/wizard/base',
    'model/gnome',
    'model/location',
    'model/environment/wind',
    'model/movers/wind',
    'model/outputters/trajectory',
    'model/environment/water',
    'views/form/text',
    'views/form/model',
    'views/form/wind',
    'views/form/custom',
    'views/modal/loading',
    'views/form/spill/type-wizcompat',
    'views/form/water'
], function($, _, Backbone, swal, BaseWizard, GnomeModel,
    GnomeLocation, GnomeWind, GnomeWindMover,
    TrajectoryOutputter, GnomeWater,
    TextForm, ModelForm, WindForm, CustomForm,
    LoadingModal, SpillTypeWizForm, WaterForm){
    'use strict';
    var locationWizardView = BaseWizard.extend({
        steps: [],
        initialize: function(opts){
            this.location = new GnomeLocation({id: opts.slug});
            this.name = opts.name;
            this.location.fetch({
                success: _.bind(this.found, this),
                error: _.bind(this.notfound, this)
            });
        },

        found: function(){
            webgnome.model.fetch({
                success: _.bind(this.load_location, this),
                error: _.bind(this.failed_load, this)
            });
        },

        failed_load: function(){
            console.log('Location model failed to load');
            swal({
                title: 'Failed to Load Location',
                text: 'Something went wrong while loading the location model.',
                type: 'error',
            });
        },

        helpNameConvert: function(text) {
            return text.split(",")[0].replace(/\s/g, "_");
        },

        load_location: function() {
            webgnome.model.set('uncertain', false);
            webgnome.model.save(null, {validate: false});

            // clear any previously loaded steps
            _.each(this.steps, function(el){
                el.close();
            });
            this.steps = [];

            // set up each step described in the location file.
            _.each(this.location.get('steps'), _.bind(function(el){
                var textOpts;
            	var title = [];
                title[0] = el.title;
                title[1] = this.name;

                var helpFilename = this.helpNameConvert(this.name);

                if(el.type === 'welcome'){
                    title[0] = 'Ubicación Precargada';
                    textOpts = {
                        name: el.name,
                        title: title.join(': '),
                        body: el.body, //+ "<p>For background information on the Location File for  " + title[1] + " click on the help link at the top of this form.</p>",
                        buttons: el.buttons,
                        moduleId: 'views/model/locations/' + helpFilename,
                    };

                    this.steps.push(new TextForm(textOpts));
                }
                else if (el.type === 'text') {
                    var body = [];
                    // for now this is overriding the text in individual location file .json files
                    // as they are not individually customized
                    if (el.title === 'Viento') {
                            body = "<p>El viento puede influir significativamente en el movimiento del petróleo.</p><p>La siguiente forma tiene diferentes opciones para cargar el campo de viento. Puedes: <ul><li>Introducir valores para un viento constante en una dirección y velocidad.</li><li>Introducir valores para un viento que cambia en dirección y/o velocidad en el tiempo.</li><li>Subir un archivo con datos.</li></ul></p>"
                            //<p>Wind can significantly influence oil movement and can force oil to move in a different direction from the currents.</p><p>The next form has several options for including a point (spatially constant) wind. You can:<ul><li>Enter values for a wind that is constant in direction and speed for the entire model run,</li><li>Enter values for a wind that varies in direction and/or speed over time,</li><li>Link directly to the latest NOAA NWS marine forecast,</li><li>Upload a file with wind data</li></ul></p><p>If you'd like to use a gridded model product for winds, you can upload it later from the Setup View.";
                    }
                    else {
                    	body = el.body;
                    }

                    textOpts = {
                        name: el.name,
                        title: title.join(': '),
                        body: body,
                        buttons: el.buttons
                    };

                    this.steps.push(new TextForm(textOpts));
                }
                else if (el.type === 'model') {
                    this.steps.push(new ModelForm({
                        name: el.name,
                        title: title.join(': '),
                        body: el.body,
                        buttons: el.buttons
                    }, webgnome.model));
                }
                else if (el.type === 'wind') {
                    if (!el.title) {
                        title[0] = 'Wind';
                    }

                    var windMover = new GnomeWindMover();
                    var wind = new GnomeWind();
                    windMover.set('wind', wind);

                    var windform = new WindForm({
                        name: el.name,
                        title: title.join(': '),
                        body: el.body,
                        buttons: "<button type='button' class='cancel' data-dismiss='modal'>Cancelar</button><button type='button' class='back'>Atrás</button><button type='button' class='next'>Siguiente</button>"
                    },
                    {'superModel': windMover, 'model': windMover.get('wind')
                    });

                    windform.on('save', _.bind(function(){
                        webgnome.model.get('movers').add(windMover, {merge: true});
                        webgnome.model.get('environment').add(windMover.get('wind'), {merge: true});
                    }, this));

                    this.steps.push(windform);
                }
                else if (el.type === 'currents') {
                  if (!el.title) {
                      title[0] = 'Current';
                  }

                  var currentMover = new GnomeCurrentMover();
                  var wind = new GnomeCurrent();
                  currentMover.set('current', current);

                  var currentform = new CurrentForm({
                      name: el.name,
                      title: title.join(': '),
                      body: el.body,
                      buttons: "<button type='button' class='cancel' data-dismiss='modal'>Cancel</button><button type='button' class='back'>Back</button><button type='button' class='next'>Next</button>"
                  },
                  {'superModel': currentMover, 'model': currentMover.get('current')
                  });

                  currentform.on('save', _.bind(function(){
                      webgnome.model.get('movers').add(currentMover, {merge: true});
                      webgnome.model.get('environment').add(currentMover.get('current'), {merge: true});
                  }, this));

                  this.steps.push(currentform);
                }

                else if (el.type ==='custom') {
                    var customForm = new CustomForm({
                        title: title.join(': '),
                        body: el.body + "<p>If you need more information on this option you can click on the help link at the top of this form.</p>",
                        buttons: el.buttons,
                        module: el.module,
                        functions: el.functions,
                        moduleId: 'views/model/locations/' + helpFilename,
                    });
                    this.steps.push(customForm);
                }
                else if (el.type === 'finish') {
                    if (!el.title) {
                        title[0] = 'Casi listo';
                    }

                    var finishForm = new TextForm({
                        name: el.name,
                        title: title.join(': '),
                        body: "<div><p>Presionando el botón <b>Ejecutar Modelo</b> el botón te llevará a la <b>Mapa View</b> donde puedes visualizar el movimiento del petróleo.</p> <p>Puedes cambiar entre Vistas usando los íconos mostrados abajo que aparecen en la parte superior derecha de tu navegador.<ul><li> Para hacer modificaciones a tu configuración del modelo, Cambia a la <b>Setup View</b>.</li> <li> Para ver las estimaciones del petróleo, cambia a la  <b>Fate View.</b></li></ul></p><p><img src='img/view_icons.png' alt='Imagen de los íconos de las Vistas' style='width:473px;height:180px;'></p></div>",
                        buttons: "<button type='button' class='cancel' data-dismiss='modal'>Cancelar</button><button type='button' class='back'>Atrás</button><button type='button' class='finish' data-dismiss='modal'>Ejecutar Modelo</button>"
                    });

                    finishForm.on('finish', function() {
                        webgnome.model.save().always(function() {
                            localStorage.setItem('view', 'trajectory');
                            localStorage.setItem('autorun', true);
                            webgnome.router.navigate('trajectory', true);
                        });
                    });

                    this.steps.push(finishForm);
                }

            }, this));

            var stepLength = this.steps.length;

            var spillWizForm = new SpillTypeWizForm({
                name: 'paso' + (stepLength - 2),
                title: 'Selecciona el tipo de derrame'//<span class="sub-title">GNOME Wizar</span>'
            }).on('select', _.bind(function(form) {
                form.title += '<span class="sub-title"></span>';
                form.name = 'paso' + (stepLength - 2);
                form.buttons = '<button type="button" class="cancel" data-dismiss="modal">Cancelar</button><button type="button" class="back">Atrás</button><button type="button" class="next">Siguiente</button>';

                // dynamically add the water form to the wizard if the substance is weatherable
                form.on('save', _.bind(function(){
                    this.dynamicWaterListener(form.model.get('element_type').get('substance'));
                }, this));

                this.register(form);
                this.steps[this.step].on('hidden', _.bind(function(){
                    this.close();
                }, this.steps[this.step]));

                this.steps[this.step] = form;

                form.on('save', _.bind(function(){
                    webgnome.model.get('spills').add(form.model);
                }, this));
            }, this));

            this.steps.splice(stepLength - 1, 0, spillWizForm);

            this.start();
        },


        next: function(){
            BaseWizard.prototype.next.call(this);
            if (this.step > 1 && this.step <= this.furthestStep) {
                this.checkWindDefault();
            }
        },

        checkWindDefault: function(){
            if (_.has(this.steps[this.step + 1], 'model') &&
                this.steps[this.step + 1].model.get('obj_type').indexOf('Wind') !== -1) {
                    this.steps[this.step + 1].model.set('timeseries', [[webgnome.model.get('start_time'), [0, 0]]]);
            }
        },

        dynamicWaterListener: function(substance){
            var waterExists = this.steps[this.steps.length - 2].className.indexOf('water-form') > -1;
            if (!_.isNull(substance) && !waterExists){
                var waterForm = this.addWaterForm();
                this.steps.splice(this.steps.length - 1, 0, waterForm);
            }
        },

        addWaterForm: function() {
            var water = new GnomeWater();
            var waterForm = new WaterForm({
                    title: 'Propiedades del Agua',// <span class="sub-title">GNOME Wizard</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancelar</button><button type="button" class="back">Atrás</button><button type="button" class="next">Siguiente</button>',
                }, water).on('save', function(){
                    webgnome.model.get('environment').add(water);
            });
            waterForm.on('save', this.next, this);
            waterForm.on('back', this.prev, this);
            waterForm.on('wizardclose', this.close, this);
            waterForm.on('finish', this.close, this);

            return waterForm;
        },

        notfound: function(){
            console.log('location was not found');
            swal({
                title: 'Ubicación no encontrada',
                text: 'La ubicación solicitada no fue encontrada en el servidor', //The requested location wasn\'t found on the server',
                type: 'error',
            });
        }
    });

    return locationWizardView;
});
