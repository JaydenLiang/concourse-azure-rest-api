# Concourse resource type for Azure REST API

This is a Concourse resource type for a fetching the JSON response from making an Azure REST API request over HTTPS.

This resource type requires a service principal under a subscription of a certain Azure account.

## Basic usage

The basic usages of this resource type in your Concourse pipe-line.

***Defining the resource type***:

Example of using the docker image of this project in a private registry.

```yaml
resource_types:
  - name: azure-rest-api
    type: docker-image
    source:
      repository: <private-registry>/azure-rest-api
      username: <username-for-private-registry-authentication>
      password: <password-for-private-registry-authentication>
```

Example of using the docker image of this project in the Docker Hub registry.

*Sorry!* We don't have a plan to publish the docker image of this project to the Docker Hub registry at this moment. But if we were to do so, the source type may look like:

```yaml
resource_types:
  - name: azure-rest-api
    type: docker-image
    source:
      repository: <namespace>/azure-rest-api
      tag: latest
```

***Defining the resource***:

```yaml
resources:
- name: resource-azure-rest-api
    type: azure-rest-api
    source:
      # required
      url: 'https://management.azure.com/subscriptions/{subscription}/providers/Microsoft.Compute/locations/{location}/publishers/{publisher}/artifacttypes/vmimage/offers/{offer}/skus/{sku}/versions?api-version=2020-12-01'
      # conditionally required
      client_id: my-client-id
      client_secret: my-client-secret
      subscription: my-subscription
      tenant: my-tenant
      # optional, used in url substitute
      location: my-location
      publisher: my-publisher
      offer: my-offer
      sku: my-sku
```

***Defining a 'get' and a 'task' in jobs***:

```yaml
jobs:
  - name: demo
    public: true
    plan:
      - get: pipeline-repo
      - get: resource-azure-rest-api
        params:
          # required
          url: 'https://management.azure.com/subscriptions/{subscription}/providers/Microsoft.Compute/locations/{location}/publishers/{publisher}/artifacttypes/vmimage/offers/{offer}/skus/{sku}/versions?api-version=2020-12-01'
          # conditionally required
          client_id: my-client-id
          client_secret: my-client-secret
          subscription: my-subscription
          tenant: my-tenant
          # optional, used in url substitute
          location: my-location
          publisher: my-publisher
          offer: my-offer
          sku: my-sku
      - task: output-rest-api
        config:
          platform: linux
          image_resource:
            type: docker-image
            source: { repository: busybox }
          inputs:
            - name: resource-azure-rest-api
          outputs:
            - name: demo_outputs
          run:
            path: <a-script-to-run>
```

## Parameters

This is a list of parameters which could be passed as the source of the Azure REST API Concourse resource type.
Note: The mentioned Microsoft Azure resources or services, are the subjects related to the target to send the REST API.

* `url`: *Required.* The full URL of the REST API, including the scheme, host. e.g. `https://management.azure.com/`. It can also include optional query parameters available in each REST API.
* `client_id`: *Conditional.* The Application (client) ID id of the Azure App in App registrations.
* `client_secret`: *Conditional.* The client secret of the Azure App in App registrations.
* `subscription`: *Conditional.* The Subscription.
* `tenant`: *Conditional.* The Directory (tenant) ID of the Azure App in App registrations.
* `from_local_path`: *Optional.* The (absolute or relative) path to a file built into the docker image. This file contains one or more optional parameters to be used in the resource. `*WARNING*`: It's unsafe to store a credential in a docker image. `*DO NOT*` use this unless you build your own docker image and publish it to a private registry and do it at your own risks of exposing your sensitive information.

Any number of extra optional parameters can be included too. Parameters other than the above ones are considered *Optional* parameter. See the [Parameter requirements](#parameter-requirements) of this README for detailed descriptions.

To find all available REST API, please go to the Microsoft official website: [REST API Browser](https://docs.microsoft.com/en-us/rest/api/). [Example REST API](https://docs.microsoft.com/en-us/rest/api/compute/virtualmachineimages/list).

### Parameter requirements

The *required* parameters must be specified in the YAML file.
The *conditional* parameters are considered *required* unless the `from_local_path` is specified. The *conditional* parameters can be made available in the local file while the *required* ones cannot.

Extra *optional* parameters can be provided in the YAML file as well as in the local file.

### The local file

`*A reminder again*`, It's unsafe to store a credential in a docker image. ***DO NOT*** use this unless you build your own docker image and publish it to a private registry and do it at your own risks of exposing your sensitive information.

The `from_local_path` specifies a file that contains an arbitrary JSON object which specifies a list of parameters to be passed to the resource scripts during the `check` and `in`. The local files are built into the docker file during the

```bash
docker build
```

***\*Source directory\**** for the local files are expected to be placed in the `./params` directory when you use the provided `Dockerfile`. You can also modify the location in the `Dockerfile`.

***\*Destination directory\**** for the local files must be made accessible to the scripts. And the `from_local_path` must point to a file in the destination directory accordingly. The destination directory is `/opt/params` by default. You can also modify the location in the `Dockerfile`.

The following lines in the [Dockerfile](./Dockerfile) show how the `./params` diectory will be copied into the docker image during building.

```docker
RUN cp -R scripts/ /opt/resource/
RUN cp -R dist/bin/ /opt/bin/
RUN cp -R params/ /opt/params/ # This line is to copy local files from *source directory* to *destination directory* as mentioned above.
```

For example, the content of a local file may look like:

```text
{
  "client_id": "my-clinet-id",
  "client_secret": "my-clinet-secret",
  "subscription": "my-subscription",
  "location": "my-location",
  "publisher": "my-publisher",
  "offer": "my-offer",
  "sku": "my-sku"
}
```

The above parameters (each property) will be available in the scripts. e.g. `client_id` has a value `my-client-id`.

#### Parameter precedences

In short: `params in the YAML file` ***>*** `params in the local file`.
A parameter specified in the YAML file has higher precedence than the same parameter specified in the local file.

### Substituting the url parameter

You can substitute ***conditional*** and ***optional*** parameters in the `url` parameter.

#### Substitute syntax

The syntax for parameter substitute is simply wrapping each parameter a pair of parentheses. For examples:

The value of the `url` parameter with substritute syntax looks like:

```text
https://management.azure.com/subscriptions/{subscription}/providers/Microsoft.Compute/locations/{location}/publishers/{publisherName}/artifacttypes/vmimage/offers/{offer}/skus/{skus}/versions?api-version=2020-12-01
```

***{subscription}*** will be replaced with the actual value of the provided ***subscription*** parameter.

***{location}*** will be replaced with the actual value of the provided ***location*** parameter.

You can then add the corresponding parameters along with the `url` in the pipe-line YAML file:

In the `resource`:

```yaml
resources:
  - name: resource-azure-rest-api
    type: azure-rest-api
    source:
      repository: registry.docker.fornow.app/v2/azure-rest-api
      subscription: my-subscription
      location: my-location
      publisher: my-publisher
      offer: my-offer
      sku: my-sku
      url: 'https://management.azure.com/subscriptions/{subscription}/providers/Microsoft.Compute/locations/{location}/publishers/{publisher}/artifacttypes/vmimage/offers/{offer}/skus/{sku}/versions?api-version=2020-12-01'
```

In the `jobs`:

```yaml
jobs:
  - name: demo
    public: true
    plan:
    - get: resource-azure-rest-api
        params:
          subscription: my-subscription
          location: my-location
          publisher: my-publisher
          offer: my-offer
          sku: my-sku
          url: 'https://management.azure.com/subscriptions/{subscription}/providers/Microsoft.Compute/locations/{location}/publishers/{publisher}/artifacttypes/vmimage/offers/{offer}/skus/{sku}/versions?api-version=2020-12-01'
```

## Output

The content of the Azure REST API result will be stored in the file with the name: ***rest-api*** in the destination directory as command line argument $1 given to the ```in``` script.

For example, if the destination directory in $1 is ```/tmp/build/get/```, the file that contains the conent of the result will be: ```/tmp/build/get/rest-api```.

More detail information about the destination directory can be found in this [Concourse CI](https://concourse-ci.org/implementing-resource-types.html) documentation page.
## Issues

please report issue to the [Issues](https://github.com/JaydenLiang/concourse-resource-type-azure-rest-api/issues) page.

## Support

## License

[License](./LICENSE). All rights reserved.
