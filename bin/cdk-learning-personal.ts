#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CdkLearningPersonalStack } from '../lib/cdk-learning-personal-stack';

const app = new cdk.App();
new CdkLearningPersonalStack(app, 'CdkLearningPersonalStack');
