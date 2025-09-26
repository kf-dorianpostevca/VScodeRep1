/**
 * BMad Method CLI Module
 * Command-line interface for the BMad agile development methodology
 */

import { Command } from 'commander';
import { createLogger } from '@intelligent-todo/shared';
import { BmadOrchestrator } from './orchestrator';
import { BmadWorkflowManager } from './workflow-manager';
import { BmadAgentManager } from './agent-manager';

const logger = createLogger('bmad-cli');

export class BmadCLI {
  private orchestrator: BmadOrchestrator;
  private workflowManager: BmadWorkflowManager;
  private agentManager: BmadAgentManager;

  constructor() {
    this.orchestrator = new BmadOrchestrator();
    this.workflowManager = new BmadWorkflowManager();
    this.agentManager = new BmadAgentManager();
  }

  public setupCommands(program: Command): void {
    const bmadCommand = program
      .command('bmad')
      .description('BMad Method - AI-driven agile development workflow');

    // Core BMad commands
    bmadCommand
      .command('help')
      .description('Show BMad help and available commands')
      .action(() => this.showHelp());

    bmadCommand
      .command('status')
      .description('Show current BMad workflow status')
      .action(() => this.showStatus());

    // Workflow commands
    const workflowCommand = bmadCommand
      .command('workflow')
      .description('BMad workflow management');

    workflowCommand
      .command('list')
      .description('List available workflows')
      .action(() => this.listWorkflows());

    workflowCommand
      .command('start <workflowName>')
      .description('Start a specific workflow')
      .action((workflowName: string) => this.startWorkflow(workflowName));

    workflowCommand
      .command('guidance')
      .description('Get personalized workflow selection guidance')
      .action(() => this.workflowGuidance());

    // Agent commands
    const agentCommand = bmadCommand
      .command('agent')
      .description('BMad agent management');

    agentCommand
      .command('list')
      .description('List available agents')
      .action(() => this.listAgents());

    agentCommand
      .command('activate <agentName>')
      .description('Activate a specific agent')
      .action((agentName: string) => this.activateAgent(agentName));

    // Task commands
    bmadCommand
      .command('task <taskName>')
      .description('Execute a specific BMad task')
      .option('-a, --agent <agent>', 'Specify which agent to use')
      .action((taskName: string, options: { agent?: string }) =>
        this.executeTask(taskName, options.agent));

    // Planning commands
    const planCommand = bmadCommand
      .command('plan')
      .description('BMad planning commands');

    planCommand
      .command('create')
      .description('Create a detailed workflow plan')
      .action(() => this.createPlan());

    planCommand
      .command('status')
      .description('Show current plan progress')
      .action(() => this.planStatus());

    planCommand
      .command('update')
      .description('Update plan status')
      .action(() => this.updatePlan());

    // Initialize command
    bmadCommand
      .command('init')
      .description('Initialize BMad method in current project')
      .action(() => this.initializeBmad());
  }

  private async showHelp(): Promise<void> {
    try {
      await this.orchestrator.displayHelp();
    } catch (error) {
      logger.error('Error showing BMad help:', error);
      console.error('❌ Failed to show BMad help. Please check your .bmad-core configuration.');
    }
  }

  private async showStatus(): Promise<void> {
    try {
      await this.orchestrator.showStatus();
    } catch (error) {
      logger.error('Error showing BMad status:', error);
      console.error('❌ Failed to show BMad status.');
    }
  }

  private async listWorkflows(): Promise<void> {
    try {
      await this.workflowManager.listWorkflows();
    } catch (error) {
      logger.error('Error listing workflows:', error);
      console.error('❌ Failed to list workflows. Please ensure .bmad-core is configured.');
    }
  }

  private async startWorkflow(workflowName: string): Promise<void> {
    try {
      await this.workflowManager.startWorkflow(workflowName);
    } catch (error) {
      logger.error(`Error starting workflow ${workflowName}:`, error);
      console.error(`❌ Failed to start workflow: ${workflowName}`);
    }
  }

  private async workflowGuidance(): Promise<void> {
    try {
      await this.workflowManager.provideGuidance();
    } catch (error) {
      logger.error('Error providing workflow guidance:', error);
      console.error('❌ Failed to provide workflow guidance.');
    }
  }

  private async listAgents(): Promise<void> {
    try {
      await this.agentManager.listAgents();
    } catch (error) {
      logger.error('Error listing agents:', error);
      console.error('❌ Failed to list agents. Please ensure .bmad-core is configured.');
    }
  }

  private async activateAgent(agentName: string): Promise<void> {
    try {
      await this.agentManager.activateAgent(agentName);
    } catch (error) {
      logger.error(`Error activating agent ${agentName}:`, error);
      console.error(`❌ Failed to activate agent: ${agentName}`);
    }
  }

  private async executeTask(taskName: string, agentName?: string): Promise<void> {
    try {
      if (agentName) {
        await this.agentManager.executeTask(taskName, agentName);
      } else {
        await this.orchestrator.executeTask(taskName);
      }
    } catch (error) {
      logger.error(`Error executing task ${taskName}:`, error);
      console.error(`❌ Failed to execute task: ${taskName}`);
    }
  }

  private async createPlan(): Promise<void> {
    try {
      await this.orchestrator.createPlan();
    } catch (error) {
      logger.error('Error creating plan:', error);
      console.error('❌ Failed to create workflow plan.');
    }
  }

  private async planStatus(): Promise<void> {
    try {
      await this.orchestrator.showPlanStatus();
    } catch (error) {
      logger.error('Error showing plan status:', error);
      console.error('❌ Failed to show plan status.');
    }
  }

  private async updatePlan(): Promise<void> {
    try {
      await this.orchestrator.updatePlan();
    } catch (error) {
      logger.error('Error updating plan:', error);
      console.error('❌ Failed to update plan.');
    }
  }

  private async initializeBmad(): Promise<void> {
    try {
      await this.orchestrator.initialize();
    } catch (error) {
      logger.error('Error initializing BMad:', error);
      console.error('❌ Failed to initialize BMad method.');
    }
  }
}

export * from './orchestrator';
export * from './workflow-manager';
export * from './agent-manager';