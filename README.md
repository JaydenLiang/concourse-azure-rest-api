# Concourse resource type for Azure REST API

This is a Concourse resource type for a fetching the JSON response from making an Azure REST API request over HTTPS.

This resource type requires a service principal under a subscription of a certain Azure account.

## Source parameters

This is a list of parameters which could be passed as the source of the Azure REST API Concourse resource type.
Note: The mentioned Microsoft Azure resources or services, are the subjects related to the target to send the REST API.

* `tenant`: *Required.* The Directory (tenant) ID of the Azure App in App registrations.
* `client_id`: *Required.* The Application (client) ID id of the Azure App in App registrations.
* `client_secret`: *Required.* The client secret of the Azure App in App registrations.
* `url`: *Required.* The full URL of the REST API, including the scheme, host. e.g. `https://management.azure.com/`. It can also include optional query parameters available in each REST API.

  To find all available REST API, please go to the Microsoft official website: [REST API Browser](https://docs.microsoft.com/en-us/rest/api/).

## Issues

please report issue to the [Issues](https://github.com/JaydenLiang/concourse-resource-type-azure-rest-api/issues) page.

## Support

## License

[License](./LICENSE). All rights reserved.
