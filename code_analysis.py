#!/usr/bin/env python3
"""
Comprehensive code quality analysis for Angular Join project.
Analyzes files for line count limits and function size limits.
"""

import os
import re
from pathlib import Path
from typing import List, Tuple, Dict

class CodeAnalyzer:
    def __init__(self, src_directory: str):
        self.src_directory = src_directory
        self.max_file_lines = 400
        self.max_function_lines = 14
        
    def analyze_project(self) -> Dict:
        """Analyze entire project for code quality issues."""
        results = {
            'large_files': [],
            'large_functions': [],
            'large_constructors': [],
            'large_html_files': [],
            'large_scss_files': []
        }
        
        for root, dirs, files in os.walk(self.src_directory):
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, self.src_directory)
                
                try:
                    if file.endswith('.ts'):
                        self._analyze_typescript_file(file_path, rel_path, results)
                    elif file.endswith('.html'):
                        self._analyze_html_file(file_path, rel_path, results)
                    elif file.endswith('.scss'):
                        self._analyze_scss_file(file_path, rel_path, results)
                except Exception as e:
                    print(f"Error analyzing {rel_path}: {e}")
        
        return results
    
    def _analyze_typescript_file(self, file_path: str, rel_path: str, results: Dict):
        """Analyze TypeScript file for violations."""
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            line_count = len(lines)
            
            # Check file size
            if line_count > self.max_file_lines:
                results['large_files'].append((rel_path, line_count))
            
            content = ''.join(lines)
            self._analyze_functions_in_content(content, rel_path, results)
    
    def _analyze_html_file(self, file_path: str, rel_path: str, results: Dict):
        """Analyze HTML file for size violations."""
        with open(file_path, 'r', encoding='utf-8') as f:
            line_count = len(f.readlines())
            if line_count > self.max_file_lines:
                results['large_html_files'].append((rel_path, line_count))
    
    def _analyze_scss_file(self, file_path: str, rel_path: str, results: Dict):
        """Analyze SCSS file for size violations."""
        with open(file_path, 'r', encoding='utf-8') as f:
            line_count = len(f.readlines())
            if line_count > self.max_file_lines:
                results['large_scss_files'].append((rel_path, line_count))
    
    def _analyze_functions_in_content(self, content: str, rel_path: str, results: Dict):
        """Analyze functions and methods in TypeScript content."""
        # Enhanced pattern to catch various function types
        patterns = [
            # Regular methods and functions
            r'(?:^|\n)\s*(?:async\s+)?(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:get\s+|set\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{',
            # Constructor
            r'(?:^|\n)\s*(constructor)\s*\([^)]*\)\s*\{',
            # Arrow functions in properties
            r'(\w+)\s*[:=]\s*(?:async\s+)?\([^)]*\)\s*=>\s*\{',
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, content, re.MULTILINE)
            
            for match in matches:
                func_name = match.group(1)
                start_pos = match.start()
                
                # Find the opening brace position
                brace_pos = content.find('{', start_pos)
                if brace_pos == -1:
                    continue
                
                # Count lines for this function by tracking braces
                lines_before = content[:brace_pos].count('\n')
                brace_count = 0
                func_content = content[brace_pos:]
                func_end = 0
                
                for i, char in enumerate(func_content):
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            func_end = i
                            break
                
                if func_end > 0:
                    func_lines = func_content[:func_end+1].count('\n') + 1
                    if func_lines > self.max_function_lines:
                        results['large_functions'].append((rel_path, func_name, func_lines))
                        
                        # Special tracking for constructors
                        if func_name == 'constructor':
                            results['large_constructors'].append((rel_path, func_lines))

    def print_analysis_report(self, results: Dict):
        """Print comprehensive analysis report."""
        print("=" * 60)
        print("ANGULAR JOIN PROJECT - CODE QUALITY ANALYSIS")
        print("=" * 60)
        
        # Large files
        print(f"\n📁 DATEIEN ÜBER {self.max_file_lines} ZEILEN:")
        large_files = sorted(results['large_files'], key=lambda x: x[1], reverse=True)
        for file_path, lines in large_files:
            print(f"   {lines:4d} Zeilen: {file_path}")
        
        # Large HTML files
        if results['large_html_files']:
            print(f"\n🌐 HTML DATEIEN ÜBER {self.max_file_lines} ZEILEN:")
            for file_path, lines in sorted(results['large_html_files'], key=lambda x: x[1], reverse=True):
                print(f"   {lines:4d} Zeilen: {file_path}")
        
        # Large SCSS files
        if results['large_scss_files']:
            print(f"\n🎨 SCSS DATEIEN ÜBER {self.max_file_lines} ZEILEN:")
            for file_path, lines in sorted(results['large_scss_files'], key=lambda x: x[1], reverse=True):
                print(f"   {lines:4d} Zeilen: {file_path}")
        
        # Large functions
        print(f"\n⚙️  FUNKTIONEN ÜBER {self.max_function_lines} ZEILEN:")
        large_functions = sorted(results['large_functions'], key=lambda x: x[2], reverse=True)[:20]
        for file_path, func_name, lines in large_functions:
            print(f"   {lines:2d} Zeilen: {func_name}() in {file_path}")
        
        # Large constructors
        if results['large_constructors']:
            print(f"\n🏗️  KONSTRUKTOREN ÜBER {self.max_function_lines} ZEILEN:")
            for file_path, lines in sorted(results['large_constructors'], key=lambda x: x[1], reverse=True):
                print(f"   {lines:2d} Zeilen: constructor in {file_path}")
        
        # Summary
        print(f"\n📊 ZUSAMMENFASSUNG:")
        print(f"   Dateien über {self.max_file_lines} Zeilen: {len(results['large_files'])}")
        print(f"   HTML über {self.max_file_lines} Zeilen: {len(results['large_html_files'])}")
        print(f"   SCSS über {self.max_file_lines} Zeilen: {len(results['large_scss_files'])}")
        print(f"   Funktionen über {self.max_function_lines} Zeilen: {len(results['large_functions'])}")
        print(f"   Konstruktoren über {self.max_function_lines} Zeilen: {len(results['large_constructors'])}")
        
        total_violations = (len(results['large_files']) + 
                          len(results['large_html_files']) + 
                          len(results['large_scss_files']) + 
                          len(results['large_functions']))
        
        print(f"\n🚨 GESAMTE VERSTÖSSE: {total_violations}")
        
        if total_violations == 0:
            print("✅ ALLE CODE-QUALITÄTS-KRITERIEN ERFÜLLT!")
        else:
            print("❌ REFACTORING ERFORDERLICH")

if __name__ == "__main__":
    analyzer = CodeAnalyzer("/Users/markusfischer/Sites/Join/src")
    results = analyzer.analyze_project()
    analyzer.print_analysis_report(results)
