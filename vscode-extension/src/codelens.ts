import * as vscode from "vscode";
import * as ts from "typescript";

export class PreviewCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  async provideCodeLenses(
    document: vscode.TextDocument,
  ): Promise<vscode.CodeLens[]> {
    if (!document.fileName.match(/\.(tsx|jsx)$/)) {
      return [];
    }

    const sourceFile = ts.createSourceFile(
      document.fileName,
      document.getText(),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    const components: { name: string; line: number }[] = [];

    const visit = (node: ts.Node) => {
      let name: string | undefined;
      let funcNode: ts.Node | undefined;

      if (ts.isFunctionDeclaration(node) && node.name) {
        name = node.name.text;
        funcNode = node;
      } else if (ts.isVariableStatement(node)) {
        const decl = node.declarationList.declarations[0];
        if (ts.isIdentifier(decl.name) && decl.initializer) {
          name = decl.name.text;
          funcNode = this.unwrapHOC(decl.initializer);
        }
      }

      if (name && funcNode && this.containsJsx(funcNode)) {
        components.push({
          name,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line,
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return components.map((comp) => {
      const pos = new vscode.Position(comp.line, 0);
      return new vscode.CodeLens(new vscode.Range(pos, pos), {
        title: "Preview Component",
        command: "component-preview.preview",
        arguments: [document.uri.fsPath, comp.name],
      });
    });
  }

  private unwrapHOC(node: ts.Node): ts.Node {
    if (ts.isCallExpression(node) && node.arguments.length > 0) {
      return this.unwrapHOC(node.arguments[0]);
    }
    return node;
  }

  private containsJsx(node: ts.Node): boolean {
    if (
      ts.isJsxElement(node) ||
      ts.isJsxSelfClosingElement(node) ||
      ts.isJsxFragment(node)
    ) {
      return true;
    }
    return ts.forEachChild(node, (child) => this.containsJsx(child)) || false;
  }
}
