define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/base',
    'views/form/model',
    'views/form/water',
    'views/form/wind',
    'views/form/spill/type-wizcompat',
    'views/form/text',
    'model/gnome',
    'model/environment/wind',
    'model/environment/water',
], function($, _, Backbone, BaseWizard,
        ModelForm, WaterForm, WindForm, SpillTypeForm, TextForm,
        GnomeModel, GnomeWind, GnomeWater){
    'use strict';
    var adiosWizard = BaseWizard.extend({
        initialize: function(){
            webgnome.model = new GnomeModel({
                name: 'ADIOS Model',
                duration: 432000
            });
            webgnome.model.save(null, {
                validate: false,
                error: this.fail,
                success: _.bind(this.setup, this)
            });
        },

        setup: function(){
            var wind = new GnomeWind();
            var water = new GnomeWater();

            this.steps = [
                new ModelForm({
                    name: 'step1',
                    title: 'Configuración del modelo <span class="sub-title"></span>',//ADIOS Wizard</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancelar</button><button type="button" class="next">Siguiente</button>',
                }, webgnome.model),
                new WaterForm({
                    name: 'step2',
                    title: 'Propiedades del agua <span class="sub-title"></span>',//ADIOS Wizard</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancelar</button><button type="button" class="back">Atrás</button><button type="button" class="next">Siguiente</button>',
                }, water).on('save', function(){
                    webgnome.model.get('environment').add(water);
                }),
                new WindForm({
                    name: 'step3',
                    title: 'Viento <span class="sub-title"></span>',//ADIOS Wizard</span>',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancelar</button><button type="button" class="back">Atrás</button><button type="button" class="next">Siguiente</button>',
                }, wind).on('save', function(){
                    webgnome.model.get('environment').add(wind);
                }),
                new SpillTypeForm({
                    name: 'step4',
                    title: 'Seleccionar tipo de petróleo <span class="sub-title"></span>',//ADIOS Wizard</span>'
                }).on('select', _.bind(function(form){
                    form.title += '';//<span class="sub-title">ADIOS Wizard</span>';
                    form.name = 'step4';
                    form.$el.addClass('adios');
                    form.buttons = '<button type="button" class="cancel" data-dismiss="modal">Cancelar</button><button type="button" class="back">Atrás</button><button type="button" class="next">Siguiente</button>';
                    this.register(form);
                    this.steps[this.step].on('hidden', _.bind(function(){
                        this.close();
                    }, this.steps[this.step]));
                    this.steps[this.step] = form;
                    form.on('save', function(){
                        webgnome.model.get('spills').add(form.model);
                    });
                }, this)),
                new TextForm({
                    name: 'step5',
                    title: 'Finalizar el modelo <span class="sub-title"></span>',//ADIOS Wizard</span>',
                    body: 'Tu modelo está configurado y listo para ejecutarse',//'You\'re model is setup and ready to run',
                    buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancelar</button><button type="button" class="back">Atrás</button><button type="button" class="finish" data-dismiss="modal">Ejecutar</button>'
                }).on('finish', function(){
                    webgnome.model.save().always(function(){
                        localStorage.setItem('view', 'fate');
                        webgnome.router.navigate('model', true);
                    });
                })
            ];
            this.start();
        },

        fail: function(){
            alert('No es posible configurar un nuevo modelo en el servidor');//'Unabled to setup a new model on the server!');
            console.log('Unable to setup a new model on the server!');
        }

    });
    return adiosWizard;
});
