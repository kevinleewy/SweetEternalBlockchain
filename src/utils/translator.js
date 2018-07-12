import de from '../assets/language/de';
import en from '../assets/language/en';
import es from '../assets/language/es';
import fa from '../assets/language/fa';
import fr from '../assets/language/fr';
import hi from '../assets/language/hi';
import ja from '../assets/language/ja';
import ko from '../assets/language/ko';
import ms from '../assets/language/ms';
import pt from '../assets/language/pt';
import th from '../assets/language/th';
import zh from '../assets/language/zh';

var defaultLocale = 'en';
var locale = defaultLocale;

var translations = {
	de,
	en,
	es,
	fa,
	fr,
	hi,
	ja,
	ko,
	ms,
	pt,
	th,
	zh
};

export default {
	setLocale : (_locale) => {
		if(_locale in translations){
			locale = _locale;
		} else {
			locale = defaultLocale;
		}
	},

	getLocale : (_locale) => locale,

	getLocales : () => Object.keys(translations),

	translate : (_key, _locale) => {
		if(undefined === _locale){
			_locale = locale;
		}
		if(undefined === translations[_locale]){
			_locale = defaultLocale;
		}
		if(undefined === translations[_locale][_key]){
			if(undefined === translations[defaultLocale][_key]){
				return _key;
			}
			return translations[defaultLocale][_key];
		}
		return translations[_locale][_key];
	}
}