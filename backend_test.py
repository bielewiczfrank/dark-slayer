import requests
import sys
import json
from datetime import datetime

class DarkRealmsAPITester:
    def __init__(self, base_url="https://dark-slayer.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                result = {
                    "test": name,
                    "status": "PASS",
                    "response_code": response.status_code,
                    "response_data": response.json() if response.content else {}
                }
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                result = {
                    "test": name,
                    "status": "FAIL",
                    "expected_code": expected_status,
                    "actual_code": response.status_code,
                    "response_text": response.text[:500]
                }

            self.test_results.append(result)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                "test": name,
                "status": "ERROR",
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success

    def test_get_classes(self):
        """Test get character classes"""
        success, response = self.run_test(
            "Get Character Classes",
            "GET", 
            "classes",
            200
        )
        if success:
            expected_classes = ['knight', 'mage', 'assassin', 'dark_mage', 'soldier', 'elite_soldier', 'dark_knight']
            classes_found = list(response.keys())
            print(f"Found classes: {classes_found}")
            
        return success

    def test_create_character(self, name="TestHero", class_type="knight"):
        """Test character creation"""
        success, response = self.run_test(
            "Create Character",
            "POST",
            "characters",
            200,
            data={"name": name, "class_type": class_type}
        )
        return response.get('id') if success else None, success

    def test_list_characters(self):
        """Test list characters"""
        success, response = self.run_test(
            "List Characters",
            "GET",
            "characters", 
            200
        )
        if success:
            print(f"Found {len(response)} characters")
        return success, response

    def test_get_character(self, character_id):
        """Test get specific character"""
        success, response = self.run_test(
            "Get Character",
            "GET",
            f"characters/{character_id}",
            200
        )
        return success, response

    def test_shop_items(self):
        """Test get shop items"""
        success, response = self.run_test(
            "Get Shop Items",
            "GET",
            "shop",
            200
        )
        if success:
            print(f"Found {len(response)} shop items")
        return success, response

    def test_shop_buy(self, character_id, item_id="w1"):
        """Test buying item from shop"""
        success, response = self.run_test(
            "Buy Shop Item",
            "POST", 
            "shop/buy",
            200,
            data={"character_id": character_id, "item_id": item_id}
        )
        return success, response

    def test_update_character(self, character_id):
        """Test character update"""
        success, response = self.run_test(
            "Update Character",
            "PUT",
            f"characters/{character_id}",
            200,
            data={"gold": 999}
        )
        return success, response

    def run_full_test_suite(self):
        """Run comprehensive test suite"""
        print("🚀 Starting Dark Realms API Test Suite")
        print("=" * 50)

        # Test basic API
        self.test_api_root()
        self.test_get_classes()

        # Test character operations
        char_id, create_success = self.test_create_character()
        if not create_success:
            print("❌ Character creation failed - stopping tests")
            return False

        self.test_list_characters() 
        self.test_get_character(char_id)

        # Test shop operations
        self.test_shop_items()
        
        # Test buying item - this will fail if character doesn't have enough gold
        buy_success, _ = self.test_shop_buy(char_id)
        
        # Test character update
        self.test_update_character(char_id)

        # Test character retrieval after update
        self.test_get_character(char_id)

        # Clean up - delete test character
        self.run_test("Delete Character", "DELETE", f"characters/{char_id}", 200)

        print(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        return self.tests_passed == self.tests_run

def main():
    tester = DarkRealmsAPITester()
    success = tester.run_full_test_suite()
    
    # Save detailed test results
    with open('/tmp/api_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())