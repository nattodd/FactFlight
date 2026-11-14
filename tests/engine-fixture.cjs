// Preserve the established engine regression suites while the public menu evolves.
// This test-only HTTP fixture exposes the private setup controls. It never ships in index.html.
// The profile adapter is omitted here to test the unchanged baseline engine in isolation.
// Actual public navigation and profile persistence are exercised by menu-integration.cjs
// and profile-integration.cjs; legacy save assertions here are not profile-storage evidence.
module.exports = function engineFixture(buffer) {
 return buffer.toString('utf8').replace('<script src="scripts/profile-store.js"></script><script src="scripts/profiles.js"></script>', '').replace('<script src="scripts/menus.js"></script>', `<style>
 .legacy-settings{display:block!important}.focus-session .legacy-settings{display:none!important}
 #practiceView{grid-template-columns:285px minmax(0,1fr)}.focus-session #practiceView{display:block}
 @media(max-width:900px){#practiceView{grid-template-columns:220px minmax(0,1fr)}}
 @media(max-width:680px){#practiceView{grid-template-columns:1fr}}
 </style><script>
 window.FlightMenu={home:()=>show('practiceView'),math:()=>show('practiceView'),ready:()=>show('practiceView')};
 document.getElementById('homeNav').tabIndex=-1;show('practiceView');
 </script>`);
};
