import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';

let currentRedirectTo;
Onyx.connect({
    key: ONYXKEYS.APP_REDIRECT_TO,
    callback: val => currentRedirectTo = val,
});

let currentlyViewedReportID;
Onyx.connect({
    key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    callback: val => currentlyViewedReportID = val,
});

/**
 * Redirect the app to a new page by updating the state in Onyx
 *
 * @param {*} url
 */
function redirect(url) {
    const formattedURL = Str.normalizeUrl(url);
    Onyx.merge(ONYXKEYS.APP_REDIRECT_TO, formattedURL);
}

/**
 * Redirects to the last report that was in view.
 */
function redirectToLastReport() {
    const route = !currentlyViewedReportID
        ? ROUTES.HOME
        : ROUTES.getReportRoute(currentlyViewedReportID);
    redirect(route);
}

/**
 * Keep the current route match stored in Onyx so other libs can access it
 * Also reset the app_redirect_to in Onyx so that if we go back to the current url the state will update
 *
 * @param {Object} match
 * @param {String} match.url
 */
function recordCurrentRoute({match}) {
    Onyx.merge(ONYXKEYS.CURRENT_URL, match.url);
    if (match.url === currentRedirectTo) {
        Onyx.merge(ONYXKEYS.APP_REDIRECT_TO, null);
    }
}

/**
 * When a report is being viewed, keep track of the report ID. This way when the user comes back to the app they will
 * be returned to the last report they were viewing.
 *
 * @param {Object} match
 * @param {Object} match.params
 * @param {String} match.params.reportID
 */
function recordCurrentlyViewedReportID({match}) {
    // If there's no reportID we unset the currentlyViewedReportID so that
    // we do not attempt to redirect to the previously viewed report ID.
    if (!match.params.reportID) {
        Onyx.set(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, null);
        return;
    }

    Onyx.merge(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, match.params.reportID);
}

export {
    recordCurrentRoute,
    recordCurrentlyViewedReportID,
    redirectToLastReport,
    redirect,
};
