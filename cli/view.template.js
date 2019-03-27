module.exports = class view {
  static getTemplate (options) {
    const { hasBackLink, hasSubmitButton, hasPageHeading, hasValidator } = options
    return `

<main id="content" tabindex="-1" role="main">

  {{> common/betaBanner }}
  
  ${hasBackLink ? `{{> common/backLink }}` : ''}

  <div class="grid-row">
    <div class="column-two-thirds">
      ${hasValidator ? `{{> common/errorSummary }}` : ''}
      ${hasPageHeading ? `{{> common/pageHeading pageHeading }}` : ''}
          
      <form method="POST" action="{{formAction}}" novalidate="novalidate">
        {{> common/csrfToken token=DefraCsrfToken}}
        ${hasValidator ? `
        <div class="form-group {{#getFormErrorGroupClass errors.some-data}}{{/getFormErrorGroupClass}}">
          <label id="some-data-label" class="form-label" for="some-data">
            Some data
          </label>
          {{> common/fieldError fieldId='some-data-error' message=errors.some-data }}
          <input class="form-control form-control-char-15 {{#if errors.some-data}}form-control-error{{/if}}" id="some-data" name="some-data" type="text" value="{{formValues.some-data}}">
        </div>
        ` : ''}
        ${hasSubmitButton ? `{{> common/submitButton }}` : ''}
      </form>
        
    </div>
  </div>
  
</main>
          
`
  }
}
