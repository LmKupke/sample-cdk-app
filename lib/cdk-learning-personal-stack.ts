import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import { ManagedPolicy } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';

import { defaultsDeep } from 'lodash';

export class CdkLearningPersonalStack extends cdk.Stack {
  lambdaIAM: iam.Role;
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    let properties = defaultsDeep({}, props, {
      tags: {
          "name": "cdk-learning-personal",
      }
    });
    

    super(scope, id, properties); 

    this.lambdaIAM = this.getLambdaHandlerIamRole(this);
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'hello.handler',
      role: this.lambdaIAM
    });

    const api = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: hello,
      cloudWatchRole: false,
      proxy: false,
      endpointTypes: [apigw.EndpointType.REGIONAL]
    });

    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal],
      actions: [
        "execute-api:Invoke",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:PutLogEvents",
        "logs:GetLogEvents",
        "logs:FilterLogEvents"
      ],
      resources: [api.arnForExecuteApi()]
    })

    const proxy = api.root.addProxy({
      defaultIntegration: new apigw.LambdaIntegration(hello)
    });
  
  }

  
 getLambdaHandlerIamRole(scope:any){
   return new iam.Role(scope, 'cdkWorkshopLambdaHanderRole', {
     assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
     managedPolicies: [
         ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
         ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')
     ],
   })
 }
}
