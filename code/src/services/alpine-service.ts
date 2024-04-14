import AlpineI18n from 'alpinejs-i18n';
import Alpine, { DirectiveData, DirectiveUtilities, ElementWithXAttributes } from 'alpinejs';
import { i18nJson } from '../static';

// https://github.dev/bennadel/JavaScript-Demos/tree/master/demos/json-explorer-alpine3
function TemplateOutletDirective(element: ElementWithXAttributes, metadata: DirectiveData, framework: DirectiveUtilities): void {

    // Get the template reference that we want to clone and render.
    var templateRef = framework.evaluate(metadata.expression);

    // Clone the template and get the root node - this is the node that we will
    // inject into the DOM.
    // @ts-ignore
    var clone = templateRef.content
        .cloneNode(true)
        .firstElementChild
        ;

    // For the clone, all I need to do at the moment is copy the datastack from the
    // template over to the clone. This way, even if the template doesn't have an "x-data"
    // attribute, I'll still have the right stack.
    clone._x_dataStack = Alpine.closestDataStack(element);

    // Instead of leaving the template in the DOM, we're going to swap the
    // template with a comment hook. This isn't necessary; but, I think it leaves
    // the DOM more pleasant looking.
    var domHook = document.createComment(` Template outlet hook (${metadata.expression}) with bindings (${element.getAttribute("x-data")}). `);
    // @ts-ignore
    domHook._template_outlet_ref = templateRef;
    // @ts-ignore
    domHook._template_outlet_clone = clone;

    // Swap the template-outlet element with the hook and clone.
    // --
    // NOTE: Doing this inside the mutateDom() method will pause Alpine's internal
    // MutationObserver, which allows us to perform DOM manipulation without
    // triggering actions in the framework. Then, we can call initTree() and
    // destroyTree() to have explicitly setup and teardowm DOM node bindings.
    Alpine.mutateDom(
        function pauseMutationObserver() {
            element.after(domHook);
            domHook.after(clone);
            Alpine.initTree(clone);
            element.remove();
            Alpine.destroyTree(element);
        }
    );
}

class AlpineService {

    private hideLoader() {
        const loaderContainer = document.querySelector('.loader-container');
        if (loaderContainer) { loaderContainer.remove(); }
    }

    private startup() {
        document.addEventListener('alpine:init', () => {
            Alpine.directive("template-outlet", TemplateOutletDirective);
        });
    }

    private i18n() {
        document.addEventListener('alpine-i18n:ready', () => {
            const browserLang = navigator.language;
            let candidate = '';
            let created = false;
            Object.keys(i18nJson).forEach((key) => {
                if (!window.AlpineI18n.fallbackLocale) {
                    window.AlpineI18n.fallbackLocale = key;
                }
                if (!created) {
                    if (key == browserLang) {
                        window.AlpineI18n.create(key, i18nJson);
                        created = true;
                        document.documentElement.lang = key;
                    } else if (!candidate && browserLang.startsWith(key)) {
                        candidate = key;
                    }
                }
            });
            if (!created) {
                if (candidate) {
                    window.AlpineI18n.create(candidate, i18nJson);
                    document.documentElement.lang = candidate;
                } else {
                    window.AlpineI18n.create(window.AlpineI18n.fallbackLocale, i18nJson);
                    document.documentElement.lang = window.AlpineI18n.fallbackLocale;
                }
            }
        });
    }

    public init() {
        this.startup();
        this.i18n();
        Alpine.plugin(AlpineI18n);
        Alpine.start();
        this.hideLoader();
    }

}

export const alpineService = new AlpineService();
