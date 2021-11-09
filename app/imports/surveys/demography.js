import { insert } from '/imports/api/demographies/methods';
import { initialise } from '/imports/ui/geosearch';
import { add_preference } from '/imports/api/preferences/methods';

const today = new Date();
const currentYear = today.getFullYear();

export const demography = {
    code: 'demography',
    tasks : [
        {
            title: 'Naissance',
            subtitle: "Saisissez votre année de naissance.",
            type: { 
                code: 'number',
                params: {
                    label: 'Année',
                    legend: 'Format AAAA'
                },
            },
            navbar: [
                {
                    code: 'previous',
                    label: 'Annuler',
                    action: () => quit(),
                },
                {
                    code: 'next',
                    errors: () => {
                        const selected = Session.get('selected');
                        if (selected % 1 != 0) return "Veuillez saisir un nombre entier.";
                        if (selected < 1900) return `Êtes-vous sûr d'être né en l'an ${selected} ? La doyenne de l'humanité, Nabi Tajima, est née en 1900.`;
                        if (selected > currentYear - 18) return "Désolé, mais vous devez être majeur pour participer à notre communauté.";
                        if (selected > currentYear) return `Êtes-vous sûr d'être né dans le futur en ${selected} !`;
                    },
                    action: () => {
                        const selected = Session.get('selected');
                        Session.set('survey', { birthYear: selected });
                        $('#survey').val('');
                        FlowRouter.setQueryParams({ field: 1 });
                        Session.set('selected', undefined);
                    },
                }, 
            ],
        },
        {
            title: 'Genre',
            subtitle: "Sélectionnez votre genre.",
            type: { 
                code: 'select',
                options: [
                    { code: 'F', label: 'Féminin' },
                    { code: 'M', label: 'Masculin' },
                ],
            },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next',
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        survey.gender = selected;
                        Session.set('survey', survey);            
                        FlowRouter.setQueryParams({ field: 2 });
                        Session.set('selected', undefined);
                    },
                },
            ],
        },
        {
            title: 'Profession',
            subtitle: "Sélectionnez la profession que vous exercez.",
            type: { 
                code: 'select',
                options: [
                    { code: 'Agr', label: "Agriculteurs exploitants" },
                    { code: 'Com', label: "Artisans, commerçants et chefs d'entreprise" },
                    { code: 'Cad', label: "Cadres et professions intellectuelles supérieures" },
                    { code: 'Int', label: "Professions Intermédiaires" },
                    { code: 'Emp', label: "Employés" },
                    { code: 'Ouv', label: "Ouvriers" },
                    { code: 'Ret', label: "Retraités" },
                    { code: 'Aut', label: "Autre profession" },
                    { code: 'San', label: "Sans profession" },
                ],
            },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next',
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        survey.profession = selected;
                        Session.set('survey', survey);            
                        FlowRouter.setQueryParams({ field: 3 });
                        Session.set('selected', undefined);
                    },
                },
            ],
        },
        {
            title: 'Résidence principale',
            subtitle: "Recherchez la commune de résidence de votre ménage.",
            type: { 
                code: 'geosearch',
                choose: ['municipalities'],
                select: ['municipalities', 'places'],
                transform: (selected) => {
                    contains.call({ geoJSON: selected.geoJSON }, (error, result) => {
                        if (error) {
                            console.error(error)
                        } else {
                            Session.set('choose', result);
                        }
                    });
                },
            },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next',
                    disabled: () => !Session.get('choose'),
                    action: () => {
                        const choose = Session.get('choose');
                        add_preference.call({ 
                            collection: choose.geoJSON.properties.collection, 
                            id: choose.geoJSON.properties.id, 
                            geoJSON: choose.geoJSON 
                        });
                        const survey = Session.get('survey');
                        survey.residence = choose.geoJSON;
                        Session.set('survey', survey);            
                        initialise();
                        FlowRouter.setQueryParams({ field: 4 });
                    },
                },
            ],
        },
        {
            title: 'Personnes du ménage',
            subtitle: "Indiquez le nombre de personnes de votre ménage.",
            type: { 
                code: 'number',
                params: {
                    label: 'Personnes',
                },
            }, 
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next',
                    errors: () => {
                        const selected = Session.get('selected');
                        if (selected % 1 != 0) return "Veuillez saisir un nombre entier.";
                        if (selected < 1) return "Si vous vivez seul(e), indiquez 1.";
                        if (selected > __MAX_PERSONS_PER_HOUSEHOLD) 
                            return "Votre ménage comporte trop de personnes : vous devez compter uniquement vos enfants et votre conjoint éventuel.";
                    },
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        survey.nbrOfPersons = selected;
                        Session.set('survey', survey);            
                        $('#survey').val('');
                        const next = selected === 1 ? 6 : 5;
                        FlowRouter.setQueryParams({ field: next });
                        Session.set('selected', undefined);
                    },
                }, 
            ],
        },
        {
            title: "Enfants du ménage",
            subtitle: "Indiquez le nombre d'enfants de moins de 11 ans de votre ménage.",
            type: { 
                code: 'number',
                params: {
                    label: 'Enfants',
                },
            }, 
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next',
                    errors: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        if (selected % 1 != 0) return "Veuillez saisir un nombre entier.";
                        if (selected < 0) return "Si vous n'avez pas d'enfant, indiquez 0.";
                        if ( survey.nbrOfPersons - selected < 1 ) return "Votre ménage ne peut comporter que des enfants.";
                    },
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        survey.nbrOfChildren = selected;
                        Session.set('survey', survey);            
                        FlowRouter.setQueryParams({ field: 6 });
                        Session.set('selected', undefined);
                        $('#survey').val('');
                    },
                }, 
            ],
        },
        {
            title: 'Motorisation',
            subtitle: "Indiquez le nombre de voitures de votre ménage.",
            type: { 
                code: 'number',
                params: {
                    label: 'Voitures',
                },
            }, 
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next',
                    label: 'Enregistrer',
                    errors: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        if (selected % 1 != 0) return "Veuillez saisir un nombre entier.";
                        if (selected < 0) return "Si vous n'avez pas de voiture, indiquez 0.";
                        if (selected > __MAX_CAR_OWNERSHIP && selected > survey.nbrOfPersons + 2) return "Votre ménage comporte trop de voitures.";
                    },
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        survey.nbrOfVehicles = selected;
                        insert.call(survey);
                        quit()
                    },
                },
            ],
        },
    ],    
};

function quit() {
    Session.set('selected', undefined);
    Session.set('survey', undefined);        
    FlowRouter.go('participate');
}